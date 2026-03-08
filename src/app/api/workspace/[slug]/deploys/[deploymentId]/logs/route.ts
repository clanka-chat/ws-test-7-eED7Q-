import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ slug: string; deploymentId: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug, deploymentId } = await params
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

  // Verify deployment belongs to this project
  const { data: deploy } = await supabase
    .from('deploys')
    .select('id')
    .eq('project_id', project.id)
    .eq('vercel_deployment_id', deploymentId)
    .maybeSingle()

  if (!deploy) {
    return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })
  }

  try {
    const res = await fetch(`https://api.vercel.com/v2/deployments/${deploymentId}/events`, {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch build logs' }, { status: 502 })
    }

    const events = await res.json()
    const logs = (Array.isArray(events) ? events : [])
      .map((e: { payload?: { text?: string } }) => e.payload?.text)
      .filter((text): text is string => typeof text === 'string')

    return NextResponse.json({ logs })
  } catch (err) {
    console.error('Vercel build logs error:', err)
    return NextResponse.json({ error: 'Failed to fetch build logs' }, { status: 502 })
  }
}
