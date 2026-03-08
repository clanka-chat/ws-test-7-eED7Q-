import { supabaseAdmin } from '@/lib/supabase/admin'
import { Webhooks } from '@octokit/webhooks'
import { NextResponse, type NextRequest } from 'next/server'

const webhooks = new Webhooks({
  secret: process.env.GITHUB_APP_WEBHOOK_SECRET!,
})

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

async function findProjectByRepo(repoFullName: string) {
  const { data } = await supabaseAdmin
    .from('projects')
    .select('id')
    .eq('github_repo_full_name', repoFullName)
    .single()
  return data
}

async function handlePush(payload: Record<string, unknown>) {
  const repository = payload.repository as { full_name: string } | undefined
  if (!repository) return

  const project = await findProjectByRepo(repository.full_name)
  if (!project) return

  const commits = (payload.commits ?? []) as {
    id: string
    message: string
    url: string
    author: { name: string }
  }[]

  if (commits.length === 0) return

  const rows = commits.map(commit => ({
    project_id: project.id,
    user_id: null,
    category: 'code',
    title: truncate(commit.message.split('\n')[0], 120),
    source: 'github',
    metadata: {
      sha: commit.id,
      url: commit.url,
      author: commit.author.name,
    },
  }))

  await supabaseAdmin.from('workspace_updates').insert(rows)
}

async function handlePullRequest(payload: Record<string, unknown>) {
  const action = payload.action as string | undefined
  if (!action || !['opened', 'closed'].includes(action)) return

  const repository = payload.repository as { full_name: string } | undefined
  if (!repository) return

  const project = await findProjectByRepo(repository.full_name)
  if (!project) return

  const pr = payload.pull_request as {
    title: string
    number: number
    html_url: string
    merged: boolean
    user: { login: string }
  }

  let prefix: string
  if (action === 'opened') {
    prefix = `PR #${pr.number}`
  } else if (pr.merged) {
    prefix = `Merged PR #${pr.number}`
  } else {
    prefix = `Closed PR #${pr.number}`
  }

  await supabaseAdmin.from('workspace_updates').insert({
    project_id: project.id,
    user_id: null,
    category: 'code',
    title: truncate(`${prefix}: ${pr.title}`, 120),
    source: 'github',
    metadata: {
      pr_number: pr.number,
      url: pr.html_url,
      author: pr.user.login,
      action,
      merged: pr.merged,
    },
  })
}

async function handleDeploymentStatus(payload: Record<string, unknown>) {
  const repository = payload.repository as { full_name: string } | undefined
  if (!repository) return

  const deploymentStatus = payload.deployment_status as {
    state: string
    target_url: string | null
  }
  const deployment = payload.deployment as { sha: string }

  if (!['success', 'failure', 'error'].includes(deploymentStatus.state)) return

  const project = await findProjectByRepo(repository.full_name)
  if (!project) return

  const isSuccess = deploymentStatus.state === 'success'

  await supabaseAdmin.from('workspace_updates').insert({
    project_id: project.id,
    user_id: null,
    category: 'deploy',
    title: isSuccess ? 'Deployment successful' : 'Deployment failed',
    source: 'github',
    metadata: {
      sha: deployment.sha,
      url: deploymentStatus.target_url,
      state: deploymentStatus.state,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-hub-signature-256')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    const isValid = await webhooks.verify(body, signature)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = request.headers.get('x-github-event')
    const payload = JSON.parse(body) as Record<string, unknown>

    switch (event) {
      case 'push':
        await handlePush(payload)
        return NextResponse.json({ received: true })
      case 'pull_request':
        await handlePullRequest(payload)
        return NextResponse.json({ received: true })
      case 'deployment_status':
        await handleDeploymentStatus(payload)
        return NextResponse.json({ received: true })
      default:
        return NextResponse.json({ ignored: true })
    }
  } catch (err) {
    console.error('GitHub webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 200 })
  }
}
