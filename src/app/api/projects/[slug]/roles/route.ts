import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

type RouteParams = { params: Promise<{ slug: string }> }

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify project exists and user is creator
  const { data: project } = await supabase
    .from('projects')
    .select('id, creator_id')
    .eq('slug', slug)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
  if (project.creator_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { role_title, role_type, description, revenue_split } = body

  if (!role_title || !role_type || revenue_split === undefined) {
    return NextResponse.json({ error: 'role_title, role_type, and revenue_split are required' }, { status: 400 })
  }

  if (typeof revenue_split !== 'number' || revenue_split < 0 || revenue_split > 100) {
    return NextResponse.json({ error: 'revenue_split must be 0-100' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('project_roles')
    .insert({
      project_id: project.id,
      role_title,
      role_type,
      description: description ?? null,
      revenue_split,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
