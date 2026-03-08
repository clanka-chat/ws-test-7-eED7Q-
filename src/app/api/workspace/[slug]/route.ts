import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

type RouteParams = { params: Promise<{ slug: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, slug, description, stage, github_repo_url, github_repo_full_name, live_url, vercel_project_id, creator_id')
    .eq('slug', slug)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Verify user is creator or active collaborator
  const isCreator = project.creator_id === user.id

  const { data: collaborators } = await supabase
    .from('collaborators')
    .select('user_id')
    .eq('project_id', project.id)
    .eq('status', 'active')

  const isCollaborator = collaborators?.some(c => c.user_id === user.id) ?? false

  if (!isCreator && !isCollaborator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get latest terms
  const { data: terms } = await supabase
    .from('workspace_terms')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Build team array with profiles
  const allMemberIds = [
    project.creator_id,
    ...(collaborators ?? []).map(c => c.user_id),
  ]
  const uniqueMemberIds = [...new Set(allMemberIds)]

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .in('id', uniqueMemberIds)

  // Get revenue splits from terms
  const splits = (terms?.splits as Record<string, number> | null) ?? {}

  const team = (profiles ?? []).map(p => ({
    id: p.id,
    username: p.username,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    role: p.id === project.creator_id ? 'creator' : 'member',
    revenue_split: splits[p.id] ?? 0,
  }))

  // Get latest timeline updates
  const { data: timelineUpdates } = await supabase
    .from('workspace_updates')
    .select('id, category, title, description, source, metadata, created_at, user_id')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const updateUserIds = [...new Set((timelineUpdates ?? []).map(u => u.user_id).filter(Boolean))]
  const { data: updateProfiles } = updateUserIds.length > 0
    ? await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', updateUserIds)
    : { data: [] as { id: string; username: string; display_name: string; avatar_url: string }[] }

  const updateProfileMap = new Map((updateProfiles ?? []).map(p => [p.id, p]))

  const timeline = (timelineUpdates ?? []).map(({ user_id, ...rest }) => ({
    ...rest,
    user: user_id ? updateProfileMap.get(user_id) ?? null : null,
  }))

  // Remove creator_id from the project response
  const { creator_id: _, ...projectData } = project

  return NextResponse.json({
    project: projectData,
    team,
    terms: terms ?? null,
    timeline,
  })
}
