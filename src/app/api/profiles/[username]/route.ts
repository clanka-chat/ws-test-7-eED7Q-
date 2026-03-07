import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

type RouteParams = { params: Promise<{ username: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url, skills, roles, revenue_tier, privacy_revenue, privacy_projects, privacy_activity, created_at')
    .eq('username', username)
    .single()

  if (error || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Fetch user's public projects
  let projects = null
  if (!profile.privacy_projects) {
    const { data } = await supabase
      .from('projects')
      .select('id, slug, name, description, stage, tech_stack, created_at, project_roles(*)')
      .eq('creator_id', profile.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    projects = data
  }

  return NextResponse.json({ ...profile, projects })
}
