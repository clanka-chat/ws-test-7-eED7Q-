import { createClient } from '@/lib/supabase/server'
import { listDeployments } from '@/lib/vercel'
import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

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
    .select('id, creator_id, vercel_deploy_hook_url, vercel_project_id')
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

  if (!project.vercel_deploy_hook_url) {
    return NextResponse.json({ error: 'Deploy hook not configured' }, { status: 400 })
  }

  if (!project.vercel_project_id) {
    return NextResponse.json({ error: 'Vercel project not configured' }, { status: 400 })
  }

  // Trigger deploy via hook
  try {
    const hookRes = await fetch(project.vercel_deploy_hook_url, { method: 'POST' })
    if (!hookRes.ok) {
      return NextResponse.json({ error: 'Failed to trigger deploy' }, { status: 502 })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to trigger deploy' }, { status: 502 })
  }

  // Get the latest deployment ID from Vercel
  let vercelDeploymentId: string | null = null
  try {
    const deployments = await listDeployments(project.vercel_project_id, 1)
    const latest = deployments?.deployments?.[0]
    if (latest) {
      vercelDeploymentId = latest.uid ?? latest.id ?? null
    }
  } catch {
    // Non-fatal — we can still record the deploy without the Vercel ID
  }

  const { data, error } = await supabase
    .from('deploys')
    .insert({
      project_id: project.id,
      vercel_deployment_id: vercelDeploymentId,
      status: 'queued',
      triggered_by: user.id,
      source: 'manual',
    })
    .select('id, vercel_deployment_id, status')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to record deploy' }, { status: 500 })
  }

  return NextResponse.json({
    deploy_id: data.id,
    vercel_deployment_id: data.vercel_deployment_id,
    status: data.status,
  }, { status: 201 })
}
