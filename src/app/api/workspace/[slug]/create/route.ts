import { createClient } from '@/lib/supabase/server'
import { createWorkspace } from '@/lib/workspace'
import { NextResponse, type NextRequest } from 'next/server'

type RouteParams = { params: Promise<{ slug: string }> }

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, slug, name, creator_id, github_repo_name')
    .eq('slug', slug)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  if (project.creator_id !== user.id) {
    return NextResponse.json({ error: 'Only the project creator can create a workspace' }, { status: 403 })
  }

  // Check if workspace already exists
  if (project.github_repo_name) {
    return NextResponse.json({ error: 'Workspace already created' }, { status: 409 })
  }

  try {
    const workspace = await createWorkspace(supabase, project)
    return NextResponse.json(workspace, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Workspace creation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
