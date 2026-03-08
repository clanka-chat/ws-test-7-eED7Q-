import { getInstallationOctokit, GITHUB_ORG } from '@/lib/github'
import { createVercelProject, createDeployHook } from '@/lib/vercel'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function createWorkspace(
  supabase: SupabaseClient,
  project: { id: string; slug: string; name: string; creator_id: string },
) {
  // 1. Verify terms are fully accepted
  const { data: terms } = await supabase
    .from('workspace_terms')
    .select('id, status, splits')
    .eq('project_id', project.id)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!terms) {
    throw new Error('No accepted terms found for this project')
  }

  // 2. Get all team members (creator + active collaborators)
  const { data: collaborators } = await supabase
    .from('collaborators')
    .select('user_id')
    .eq('project_id', project.id)
    .eq('status', 'active')

  const memberIds = [
    project.creator_id,
    ...(collaborators ?? []).map(c => c.user_id),
  ]
  const uniqueMemberIds = [...new Set(memberIds)]

  // 3. Check prerequisites: all members have github_username
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, github_username')
    .in('id', uniqueMemberIds)

  const missingGithub = (profiles ?? []).filter(p => !p.github_username)
  if (missingGithub.length > 0) {
    throw new Error(
      'All team members must have a GitHub username set in Settings before the workspace can be created.'
    )
  }

  const githubUsernames = (profiles ?? []).map(p => p.github_username as string)

  // 4. Create GitHub repo
  const repoName = `ws-${project.slug}`
  const octokit = await getInstallationOctokit()

  let repo;
  try {
    const createRes = await octokit.request('POST /orgs/{org}/repos', {
      org: GITHUB_ORG,
      name: repoName,
      private: true,
      auto_init: true,
      description: project.name,
    });
    repo = createRes.data;
  } catch (err: unknown) {
    // Repo may already exist from a previous partial creation attempt
    if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 422) {
      const getRes = await octokit.request('GET /repos/{owner}/{repo}', {
        owner: GITHUB_ORG,
        repo: repoName,
      });
      repo = getRes.data;
    } else {
      throw err;
    }
  }

  // 5. Add team members as GitHub collaborators
  for (const username of githubUsernames) {
    await octokit.request('PUT /repos/{owner}/{repo}/collaborators/{username}', {
      owner: GITHUB_ORG,
      repo: repoName,
      username,
      permission: 'push',
    })
  }

  // 6. Create Vercel project linked to the repo
  const vercelProject = await createVercelProject(repoName, repo.full_name)

  // 7. Create Vercel deploy hook
  const deployHook = await createDeployHook(vercelProject.id, `${repoName}-deploy`)

  // 8. Update project with workspace info
  const { data: updatedProject, error } = await supabase
    .from('projects')
    .update({
      github_repo_name: repoName,
      github_repo_full_name: repo.full_name,
      github_repo_url: repo.html_url,
      vercel_project_id: vercelProject.id,
      vercel_deploy_hook_url: deployHook.url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', project.id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update project: ${error.message}`)

  return updatedProject
}
