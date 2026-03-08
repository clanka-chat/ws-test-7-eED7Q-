/**
 * One-time script to backfill deploy hook URLs for existing projects.
 *
 * Usage: source .env.local && npx tsx scripts/backfill-deploy-hooks.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and VERCEL_API_TOKEN
 * environment variables to be set in the shell.
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN!

async function main() {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, slug, vercel_project_id, vercel_deploy_hook_url')
    .not('vercel_project_id', 'is', null)
    .is('vercel_deploy_hook_url', null)

  if (error) {
    console.error('Failed to query projects:', error.message)
    process.exit(1)
  }

  if (!projects || projects.length === 0) {
    console.log('No projects need backfilling.')
    return
  }

  console.log(`Found ${projects.length} project(s) to backfill.`)

  for (const project of projects) {
    console.log(`\nProcessing: ${project.slug} (${project.vercel_project_id})`)

    const res = await fetch(`https://api.vercel.com/v9/projects/${project.vercel_project_id}`, {
      headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` },
    })

    if (!res.ok) {
      console.error(`  Failed to fetch Vercel project: ${res.status}`)
      continue
    }

    const vercelProject = await res.json()
    const hooks = vercelProject?.link?.deployHooks ?? []

    if (hooks.length === 0) {
      console.log('  No deploy hooks found — skipping.')
      continue
    }

    const hookUrl = hooks[0].url as string
    console.log(`  Found hook URL: ${hookUrl}`)

    const { error: updateError } = await supabase
      .from('projects')
      .update({ vercel_deploy_hook_url: hookUrl, updated_at: new Date().toISOString() })
      .eq('id', project.id)

    if (updateError) {
      console.error(`  Failed to update project: ${updateError.message}`)
    } else {
      console.log('  Updated successfully.')
    }
  }

  console.log('\nDone.')
}

main()
