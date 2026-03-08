const VERCEL_API_BASE = 'https://api.vercel.com'

async function vercelFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${VERCEL_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Vercel API error ${res.status}: ${body}`)
  }

  return res.json()
}

export async function createVercelProject(name: string, repoFullName: string) {
  const lcName = name.toLowerCase()
  const res = await fetch(`${VERCEL_API_BASE}/v10/projects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: lcName,
      framework: 'nextjs',
      gitRepository: { type: 'github', repo: repoFullName },
    }),
  })

  if (res.ok) return res.json()

  if (res.status === 409) {
    // Project may already exist from a previous partial attempt
    const getRes = await fetch(`${VERCEL_API_BASE}/v9/projects/${lcName}`, {
      headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}` },
    })
    if (getRes.ok) return getRes.json()
  }

  const body = await res.text()
  throw new Error(`Vercel API error ${res.status}: ${body}`)
}

export async function createDeployHook(projectId: string, name: string) {
  return vercelFetch(`/v10/projects/${projectId}/deploy-hooks`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      ref: 'main',
    }),
  })
}

export async function getDeployment(deploymentId: string) {
  const res = await fetch(`${VERCEL_API_BASE}/v13/deployments/${deploymentId}`, {
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
    },
  })
  if (!res.ok) return null
  return res.json()
}

export async function listDeployments(projectId: string, limit = 10) {
  return vercelFetch(`/v6/deployments?projectId=${projectId}&limit=${limit}`)
}
