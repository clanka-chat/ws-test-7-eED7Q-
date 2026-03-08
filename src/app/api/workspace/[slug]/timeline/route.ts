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
    .select('id, creator_id')
    .eq('slug', slug)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

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

  const { data: updates } = await supabase
    .from('workspace_updates')
    .select('id, category, title, description, source, metadata, created_at, user_id')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Get unique user IDs for profile lookup
  const userIds = [...new Set((updates ?? []).map(u => u.user_id).filter(Boolean))]
  const { data: profiles } = userIds.length > 0
    ? await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds)
    : { data: [] as { id: string; username: string; display_name: string; avatar_url: string }[] }

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  const enrichedUpdates = (updates ?? []).map(({ user_id, ...rest }) => ({
    ...rest,
    user: user_id ? profileMap.get(user_id) ?? null : null,
  }))

  return NextResponse.json({ updates: enrichedUpdates })
}
