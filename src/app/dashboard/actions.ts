'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: myProjects } = await supabase
    .from('projects')
    .select('id, slug, name, stage, created_at, project_roles(id, role_title, filled)')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  const { data: collaborations } = await supabase
    .from('collaborators')
    .select('role, revenue_split, projects!project_id(id, slug, name, stage)')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const { data: pendingRequests } = await supabase
    .from('join_requests')
    .select('id, status, message, created_at, projects!project_id(slug, name), profiles!requester_id(username, display_name, avatar_url)')
    .eq('status', 'pending')
    .in('project_id', (myProjects ?? []).map(p => p.id))
    .order('created_at', { ascending: false })

  const { data: myRequests } = await supabase
    .from('join_requests')
    .select('id, status, message, created_at, projects!project_id(slug, name)')
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false })

  return {
    data: {
      my_projects: myProjects ?? [],
      collaborations: collaborations ?? [],
      pending_requests: pendingRequests ?? [],
      my_requests: myRequests ?? [],
      earnings: { total: 0, this_month: 0, currency: 'USD' },
    },
  }
}
