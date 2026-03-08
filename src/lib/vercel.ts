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
  return vercelFetch('/v10/projects', {
    method: 'POST',
    body: JSON.stringify({
      name,
      framework: 'nextjs',
      gitRepository: {
        type: 'github',
        repo: repoFullName,
      },
    }),
  })
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
