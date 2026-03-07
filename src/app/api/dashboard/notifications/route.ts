import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's project IDs for filtering incoming requests
  const { data: myProjects } = await supabase
    .from('projects')
    .select('id')
    .eq('creator_id', user.id)

  const myProjectIds = (myProjects ?? []).map(p => p.id)

  // Pending join requests on user's projects
  const { data: pendingRequests } = myProjectIds.length > 0
    ? await supabase
        .from('join_requests')
        .select('id, status, message, created_at, projects!project_id(slug, name), profiles!requester_id(username, display_name, avatar_url)')
        .eq('status', 'pending')
        .in('project_id', myProjectIds)
        .order('created_at', { ascending: false })
        .limit(20)
    : { data: [] }

  // User's own requests that were recently accepted/rejected
  const { data: resolvedRequests } = await supabase
    .from('join_requests')
    .select('id, status, updated_at, projects!project_id(slug, name)')
    .eq('requester_id', user.id)
    .in('status', ['accepted', 'rejected'])
    .order('updated_at', { ascending: false })
    .limit(20)

  // Unread message count
  const { count: unreadMessages } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('read', false)

  return NextResponse.json({
    pending_requests: pendingRequests ?? [],
    resolved_requests: resolvedRequests ?? [],
    unread_messages: unreadMessages ?? 0,
  })
}
