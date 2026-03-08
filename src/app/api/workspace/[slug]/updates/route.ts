import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

type RouteParams = { params: Promise<{ slug: string }> }

const VALID_CATEGORIES = ['progress', 'milestone', 'blocker', 'decision'] as const

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, creator_id')
    .eq('slug', slug)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const isCreator = project.creator_id === user.id

  const { data: collaborators } = await supabase
    .from('collaborators')
    .select('user_id')
    .eq('project_id', project.id)
    .eq('status', 'active')

  const isCollaborator = collaborators?.some(c => c.user_id === user.id) ?? false

  if (!isCreator && !isCollaborator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { category, title, description } = body

  if (!category || typeof category !== 'string' || !VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    return NextResponse.json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 })
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const trimmedTitle = title.trim()
  if (trimmedTitle.length > 120) {
    return NextResponse.json({ error: 'title must be 120 characters or less' }, { status: 400 })
  }

  const trimmedDescription = typeof description === 'string' ? description.trim() : null
  if (trimmedDescription && trimmedDescription.length > 5000) {
    return NextResponse.json({ error: 'description must be 5000 characters or less' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('workspace_updates')
    .insert({
      project_id: project.id,
      user_id: user.id,
      category,
      title: trimmedTitle,
      description: trimmedDescription || null,
      source: 'web',
    })
    .select('id, created_at')
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create update' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
