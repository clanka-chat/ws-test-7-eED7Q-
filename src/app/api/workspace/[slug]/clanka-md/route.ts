import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

type RouteParams = { params: Promise<{ slug: string }> }

async function getProjectAndVerifyAccess(supabase: Awaited<ReturnType<typeof createClient>>, slug: string, userId: string) {
  const { data: project } = await supabase
    .from('projects')
    .select('id, creator_id')
    .eq('slug', slug)
    .single()

  if (!project) return { error: 'Project not found', status: 404 } as const

  const isCreator = project.creator_id === userId

  const { data: collaborators } = await supabase
    .from('collaborators')
    .select('user_id')
    .eq('project_id', project.id)
    .eq('status', 'active')

  const isCollaborator = collaborators?.some(c => c.user_id === userId) ?? false

  if (!isCreator && !isCollaborator) {
    return { error: 'Forbidden', status: 403 } as const
  }

  return { project } as const
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await getProjectAndVerifyAccess(supabase, slug, user.id)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const { project } = result

  // Fetch the current user's own clanka_file
  const { data: ownFile } = await supabase
    .from('clanka_files')
    .select('content, updated_at')
    .eq('project_id', project.id)
    .eq('user_id', user.id)
    .maybeSingle()

  // Fetch collaborators' clanka_files (RLS allows reading team files)
  const { data: collabFiles } = await supabase
    .from('clanka_files')
    .select('content, updated_at, user_id, profiles!user_id(username, display_name)')
    .eq('project_id', project.id)
    .neq('user_id', user.id)

  const collaborators = (collabFiles ?? []).map(f => {
    const profile = f.profiles as unknown as { username: string; display_name: string } | null
    return {
      username: profile?.username ?? null,
      display_name: profile?.display_name ?? null,
      content: f.content,
      updated_at: f.updated_at,
    }
  })

  return NextResponse.json({
    own: ownFile ?? null,
    collaborators,
  })
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await getProjectAndVerifyAccess(supabase, slug, user.id)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const { project } = result

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { content } = body

  if (typeof content !== 'string') {
    return NextResponse.json({ error: 'content must be a string' }, { status: 400 })
  }

  if (content.length > 50000) {
    return NextResponse.json({ error: 'content must be 50000 characters or less' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('clanka_files')
    .upsert(
      {
        project_id: project.id,
        user_id: user.id,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id,user_id' },
    )
    .select('updated_at')
    .single()

  if (error) return NextResponse.json({ error: 'Failed to save CLANKA.md' }, { status: 500 })
  return NextResponse.json({ updated_at: data.updated_at })
}
