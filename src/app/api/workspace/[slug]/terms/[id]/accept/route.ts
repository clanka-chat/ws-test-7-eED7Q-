import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

type RouteParams = { params: Promise<{ slug: string; id: string }> }

export async function PATCH(_request: NextRequest, { params }: RouteParams) {
  const { slug, id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Look up project by slug
  const { data: project } = await supabase
    .from('projects')
    .select('id, creator_id')
    .eq('slug', slug)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Verify user is a team member
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

  // Fetch the terms
  const { data: terms } = await supabase
    .from('workspace_terms')
    .select('*')
    .eq('id', id)
    .eq('project_id', project.id)
    .single()

  if (!terms) {
    return NextResponse.json({ error: 'Terms not found' }, { status: 404 })
  }

  if (terms.status !== 'proposed') {
    return NextResponse.json({ error: 'Terms are not in proposed status' }, { status: 400 })
  }

  // Check if user already accepted
  const acceptedBy: string[] = terms.accepted_by ?? []
  if (acceptedBy.includes(user.id)) {
    return NextResponse.json({ error: 'You have already accepted these terms' }, { status: 400 })
  }

  // Add user to accepted_by
  const newAcceptedBy = [...acceptedBy, user.id]

  // Check if all team members have now accepted
  const allMemberIds = new Set([
    project.creator_id,
    ...(collaborators?.map(c => c.user_id) ?? []),
  ])
  const allAccepted = [...allMemberIds].every(id => newAcceptedBy.includes(id))

  const updates: Record<string, string | string[]> = {
    accepted_by: newAcceptedBy,
  }
  if (allAccepted) {
    updates.status = 'accepted'
  }

  const { data, error } = await supabase
    .from('workspace_terms')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
