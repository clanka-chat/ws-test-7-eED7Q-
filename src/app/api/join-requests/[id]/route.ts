import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { status } = body

  if (status !== 'accepted' && status !== 'rejected') {
    return NextResponse.json({ error: 'Status must be "accepted" or "rejected"' }, { status: 400 })
  }

  // Get the join request and verify the user is the project creator
  const { data: joinRequest } = await supabase
    .from('join_requests')
    .select('*, projects!project_id(id, creator_id)')
    .eq('id', id)
    .single()

  if (!joinRequest) {
    return NextResponse.json({ error: 'Join request not found' }, { status: 404 })
  }

  const project = joinRequest.projects as { id: string; creator_id: string }
  if (project.creator_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (joinRequest.status !== 'pending') {
    return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('join_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (status === 'accepted') {
    const { error: collabError } = await supabase
      .from('collaborators')
      .insert({
        project_id: project.id,
        user_id: joinRequest.requester_id,
        role: 'member',
        revenue_split: 0,
        status: 'active',
      })

    if (collabError) return NextResponse.json({ error: collabError.message }, { status: 500 })

    // Hide listing from explore — MVP assumes one co-builder per project
    await supabase
      .from('projects')
      .update({ is_public: false, updated_at: new Date().toISOString() })
      .eq('id', project.id)
  }

  return NextResponse.json(data)
}
