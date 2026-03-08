import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getDeployment } from '@/lib/vercel'
import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ slug: string }> }

const VERCEL_STATE_MAP: Record<string, string> = {
  QUEUED: 'queued',
  BUILDING: 'building',
  INITIALIZING: 'building',
  READY: 'ready',
  ERROR: 'error',
  CANCELED: 'canceled',
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, creator_id, vercel_project_id')
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

  const { data: deploys } = await supabase
    .from('deploys')
    .select('id, vercel_deployment_id, vercel_url, status, source, error_message, created_at, triggered_by')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const deployList = deploys ?? []

  // Poll Vercel for the most recent non-terminal deploy
  if (deployList.length > 0) {
    const latest = deployList[0]
    if (latest.vercel_deployment_id && !['ready', 'error', 'canceled'].includes(latest.status ?? '')) {
      try {
        const deployment = await getDeployment(latest.vercel_deployment_id)
        if (deployment) {
          const newStatus = VERCEL_STATE_MAP[deployment.readyState ?? deployment.state] ?? latest.status
          if (newStatus !== latest.status) {
            const updates: Record<string, string> = { status: newStatus, updated_at: new Date().toISOString() }

            if (newStatus === 'ready' && deployment.url) {
              const deployUrl = `https://${deployment.url}`
              updates.vercel_url = deployUrl

              // Update projects.live_url via admin (RLS bypass)
              await supabaseAdmin
                .from('projects')
                .update({ live_url: deployUrl, updated_at: new Date().toISOString() })
                .eq('id', project.id)
            }

            if (newStatus === 'error') {
              updates.error_message = deployment.errorMessage ?? 'Deployment failed'
            }

            await supabase
              .from('deploys')
              .update(updates)
              .eq('id', latest.id)

            // Reflect updates in the response
            latest.status = newStatus
            if (updates.vercel_url) latest.vercel_url = updates.vercel_url
            if (updates.error_message) latest.error_message = updates.error_message
          }
        }
      } catch {
        // Non-fatal — return stale data rather than failing
      }
    }
  }

  // Get profile info for triggered_by users
  const userIds = [...new Set(deployList.map(d => d.triggered_by).filter(Boolean))]
  const { data: profiles } = userIds.length > 0
    ? await supabase
        .from('profiles')
        .select('id, username, display_name')
        .in('id', userIds)
    : { data: [] as { id: string; username: string; display_name: string }[] }

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  const enriched = deployList.map(({ triggered_by, ...rest }) => ({
    ...rest,
    triggered_by: triggered_by ? profileMap.get(triggered_by) ?? null : null,
  }))

  return NextResponse.json({ deploys: enriched })
}
