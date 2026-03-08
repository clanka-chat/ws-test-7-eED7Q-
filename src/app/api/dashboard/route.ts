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
    .select('role, revenue_split, project_id, projects!project_id(id, slug, name, stage, github_repo_url)')
    .eq('user_id', user.id)
    .eq('status', 'active')

  // Fetch terms status for collaborated projects
  const collabProjectIds = (collaborations ?? []).map(c => c.project_id)
  const { data: collabTerms } = collabProjectIds.length > 0
    ? await supabase
        .from('workspace_terms')
        .select('project_id, status, accepted_by')
        .in('project_id', collabProjectIds)
        .order('created_at', { ascending: false })
    : { data: [] as { project_id: string; status: string; accepted_by: string[] }[] }

  // Build a map of project_id -> latest terms info
  const termsByProject = new Map<string, { status: string; user_accepted: boolean }>()
  for (const t of collabTerms ?? []) {
    if (!termsByProject.has(t.project_id)) {
      termsByProject.set(t.project_id, {
        status: t.status,
        user_accepted: (t.accepted_by ?? []).includes(user.id),
      })
    }
  }

  const collaborationsWithTerms = (collaborations ?? []).map(c => {
    const terms = termsByProject.get(c.project_id)
    return {
      ...c,
      terms_status: terms?.status ?? null,
      terms_user_accepted: terms?.user_accepted ?? false,
    }
  })

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
    .select('id, status, message, created_at, project_id, projects!project_id(slug, name)')
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false })

  // For accepted outgoing requests, fetch terms status
  const acceptedProjectIds = (myRequests ?? [])
    .filter(r => r.status === 'accepted')
    .map(r => r.project_id)
  const { data: outgoingTerms } = acceptedProjectIds.length > 0
    ? await supabase
        .from('workspace_terms')
        .select('project_id, status')
        .in('project_id', acceptedProjectIds)
        .order('created_at', { ascending: false })
    : { data: [] as { project_id: string; status: string }[] }

  const outgoingTermsByProject = new Map<string, string>()
  for (const t of outgoingTerms ?? []) {
    if (!outgoingTermsByProject.has(t.project_id)) {
      outgoingTermsByProject.set(t.project_id, t.status)
    }
  }

  const myRequestsWithTerms = (myRequests ?? []).map(r => ({
    ...r,
    terms_status: r.status === 'accepted' ? (outgoingTermsByProject.get(r.project_id) ?? null) : null,
  }))

  // Mocked earnings
  const earnings = {
    total: 0,
    this_month: 0,
    currency: 'USD',
  }

  return NextResponse.json({
    my_projects: myProjects ?? [],
    collaborations: collaborationsWithTerms,
    pending_requests: pendingRequests ?? [],
    my_requests: myRequestsWithTerms,
    earnings,
  })
}
