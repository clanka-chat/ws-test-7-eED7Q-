'use server'

import { createClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils/slug'
import { redirect } from 'next/navigation'

type CreateProjectInput = {
  name: string
  description: string
  stage: string
  tech_stack: string[]
  business_model: string
  domain_plan: string
  time_commitment: string
  timezone: string
  is_public: boolean
  roles: {
    role_title: string
    role_type: string
    description: string
    revenue_split: number
  }[]
}

export async function createProject(input: CreateProjectInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  if (!input.name || input.name.trim().length === 0) {
    return { error: 'Project name is required' }
  }

  const slug = generateSlug(input.name)

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      slug,
      creator_id: user.id,
      name: input.name.trim(),
      description: input.description || null,
      stage: input.stage || 'idea',
      tech_stack: input.tech_stack || [],
      business_model: input.business_model || null,
      domain_plan: input.domain_plan || null,
      time_commitment: input.time_commitment || null,
      timezone: input.timezone || null,
      is_public: input.is_public ?? true,
    })
    .select()
    .single()

  if (projectError || !project) {
    return { error: projectError?.message ?? 'Failed to create project' }
  }

  // Insert roles if provided
  if (input.roles && input.roles.length > 0) {
    const rolesToInsert = input.roles.map(role => ({
      project_id: project.id,
      role_title: role.role_title,
      role_type: role.role_type,
      description: role.description || null,
      revenue_split: role.revenue_split,
    }))

    const { error: rolesError } = await supabase
      .from('project_roles')
      .insert(rolesToInsert)

    if (rolesError) {
      return { error: rolesError.message }
    }
  }

  redirect(`/project/${slug}`)
}
