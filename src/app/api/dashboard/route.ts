import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Projects I created
  const { data: myProjects } = await supabase
    .from('projects')
    .select('id, slug, name, description, stage, tech_stack, created_at, project_roles(id, role_title, role_type, revenue_split, filled)')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  // Projects I collaborate on
  const { data: collaborations } = await supabase
    .from('collaborators')
    .select('role, revenue_split, projects!project_id(id, slug, name, stage)')
    .eq('user_id', user.id)
    .eq('status', 'active')

  // Pending join requests on my projects
  const { data: pendingRequests } = await supabase
    .from('join_requests')
    .select('id, status, message, created_at, projects!project_id(slug, name), profiles!requester_id(username, display_name, avatar_url)')
    .in('status', ['pending', 'accepted'])
    .in('project_id', (myProjects ?? []).map(p => p.id))
    .order('created_at', { ascending: false })

  // My outgoing join requests
  const { data: myRequests } = await supabase
    .from('join_requests')
    .select('id, status, message, created_at, projects!project_id(slug, name)')
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false })

  // Mocked earnings
  const earnings = {
    total: 0,
    this_month: 0,
    currency: 'USD',
  }

  return NextResponse.json({
    my_projects: myProjects ?? [],
    collaborations: collaborations ?? [],
    pending_requests: pendingRequests ?? [],
    my_requests: myRequests ?? [],
    earnings,
  })
}
