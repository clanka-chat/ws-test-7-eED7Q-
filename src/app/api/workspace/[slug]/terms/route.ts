import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

type RouteParams = { params: Promise<{ slug: string }> }

async function getProjectAndVerifyMember(supabase: Awaited<ReturnType<typeof createClient>>, slug: string, userId: string) {
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

  return { project, collaborators: collaborators ?? [], isCreator } as const
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await getProjectAndVerifyMember(supabase, slug, user.id)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const { project, collaborators } = result

  const { data: terms } = await supabase
    .from('workspace_terms')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Gather team member profiles: creator + all active collaborators
  const memberIds = [
    project.creator_id,
    ...collaborators.map(c => c.user_id),
  ]
  const uniqueMemberIds = [...new Set(memberIds)]

  const { data: members } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .in('id', uniqueMemberIds)

  return NextResponse.json({
    terms: terms ?? null,
    team: members ?? [],
  })
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await getProjectAndVerifyMember(supabase, slug, user.id)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const { project, collaborators, isCreator } = result

  if (!isCreator) {
    return NextResponse.json({ error: 'Only the project creator can propose terms' }, { status: 403 })
  }

  const body = await request.json()
  const { splits } = body

  if (!splits || typeof splits !== 'object' || Array.isArray(splits)) {
    return NextResponse.json({ error: 'splits must be an object mapping user IDs to percentages' }, { status: 400 })
  }

  // Validate splits sum to 95 (5% platform fee)
  const values = Object.values(splits) as number[]
  if (values.some(v => typeof v !== 'number' || v < 0)) {
    return NextResponse.json({ error: 'All split values must be non-negative numbers' }, { status: 400 })
  }
  const sum = values.reduce((a, b) => a + b, 0)
  if (sum !== 95) {
    return NextResponse.json({ error: `Splits must sum to 95 (5% is the platform fee), got ${sum}` }, { status: 400 })
  }

  // Validate all user IDs are team members
  const validUserIds = new Set([
    project.creator_id,
    ...collaborators.map(c => c.user_id),
  ])
  const splitUserIds = Object.keys(splits)
  for (const uid of splitUserIds) {
    if (!validUserIds.has(uid)) {
      return NextResponse.json({ error: `User ${uid} is not a team member` }, { status: 400 })
    }
  }

  const { data, error } = await supabase
    .from('workspace_terms')
    .insert({
      project_id: project.id,
      created_by: user.id,
      splits,
      accepted_by: [],
      status: 'proposed',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
