import { createClient } from '@/lib/supabase/server'
import {
  listProjectEnvVars,
  addProjectEnvVar,
  updateProjectEnvVar,
  deleteProjectEnvVar,
} from '@/lib/vercel'
import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ slug: string }> }

const ENV_KEY_PATTERN = /^[A-Z_][A-Z0-9_]*$/

async function getProjectAsCreator(slug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' as const, status: 401 }

  const { data: project } = await supabase
    .from('projects')
    .select('id, creator_id, vercel_project_id')
    .eq('slug', slug)
    .single()

  if (!project) return { error: 'Project not found' as const, status: 404 }
  if (project.creator_id !== user.id) return { error: 'Forbidden' as const, status: 403 }
  if (!project.vercel_project_id) return { error: 'Vercel project not configured' as const, status: 400 }

  return { project }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const result = await getProjectAsCreator(slug)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  try {
    const data = await listProjectEnvVars(result.project.vercel_project_id)
    const envVars = (data?.envs ?? []).map((env: { id: string; key: string; target: string[]; createdAt: number }) => ({
      id: env.id,
      key: env.key,
      target: env.target,
      created_at: env.createdAt,
    }))
    return NextResponse.json({ env_vars: envVars })
  } catch (err) {
    console.error('Vercel env vars list error:', err)
    return NextResponse.json({ error: 'Failed to fetch environment variables' }, { status: 502 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const result = await getProjectAsCreator(slug)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { key, value } = body
  if (typeof key !== 'string' || !ENV_KEY_PATTERN.test(key)) {
    return NextResponse.json({ error: 'key must match /^[A-Z_][A-Z0-9_]*$/' }, { status: 400 })
  }
  if (typeof value !== 'string' || value.length === 0) {
    return NextResponse.json({ error: 'value must be a non-empty string' }, { status: 400 })
  }
  if (value.length > 65536) {
    return NextResponse.json({ error: 'value must be 64KB or less' }, { status: 400 })
  }

  try {
    await addProjectEnvVar(result.project.vercel_project_id, key, value)
    return NextResponse.json({ created: true }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message.includes('409')) {
      return NextResponse.json({ error: 'Environment variable already exists' }, { status: 409 })
    }
    console.error('Vercel env var add error:', err)
    return NextResponse.json({ error: 'Failed to add environment variable' }, { status: 502 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const result = await getProjectAsCreator(slug)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { envId, value } = body
  if (typeof envId !== 'string' || envId.length === 0) {
    return NextResponse.json({ error: 'envId is required' }, { status: 400 })
  }
  if (typeof value !== 'string' || value.length === 0) {
    return NextResponse.json({ error: 'value must be a non-empty string' }, { status: 400 })
  }
  if (value.length > 65536) {
    return NextResponse.json({ error: 'value must be 64KB or less' }, { status: 400 })
  }

  try {
    await updateProjectEnvVar(result.project.vercel_project_id, envId, value)
    return NextResponse.json({ updated: true })
  } catch (err) {
    console.error('Vercel env var update error:', err)
    return NextResponse.json({ error: 'Failed to update environment variable' }, { status: 502 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const result = await getProjectAsCreator(slug)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { envId } = body
  if (typeof envId !== 'string' || envId.length === 0) {
    return NextResponse.json({ error: 'envId is required' }, { status: 400 })
  }

  try {
    await deleteProjectEnvVar(result.project.vercel_project_id, envId)
    return NextResponse.json({ deleted: true })
  } catch (err) {
    console.error('Vercel env var delete error:', err)
    return NextResponse.json({ error: 'Failed to delete environment variable' }, { status: 502 })
  }
}
