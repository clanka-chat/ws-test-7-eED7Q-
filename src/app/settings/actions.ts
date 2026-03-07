'use server'

import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'

type ProfileUpdateInput = {
  display_name?: string
  bio?: string
  avatar_url?: string
  skills?: string[]
  roles?: string[]
  github_username?: string
  privacy_revenue?: boolean
  privacy_projects?: boolean
  privacy_activity?: boolean
}

export async function updateProfile(input: ProfileUpdateInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath(`/u/${data.username}`)
  return { data }
}

export async function generateApiKey() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const apiKey = `ck_${randomBytes(16).toString('hex')}`

  const { error } = await supabase
    .from('profiles')
    .update({ api_key: apiKey, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { api_key: apiKey }
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return { error: error.message }
  return { data }
}
