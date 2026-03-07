export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  skills: string[]
  roles: string[]
  github_username: string | null
  stripe_connected: boolean
  stripe_account_id: string | null
  revenue_tier: string | null
  privacy_revenue: boolean
  privacy_projects: boolean
  privacy_activity: boolean
  api_key: string | null
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  slug: string
  creator_id: string
  name: string
  description: string | null
  stage: string
  tech_stack: string[]
  looking_for: string | null
  business_model: string | null
  domain_plan: string | null
  time_commitment: string | null
  timezone: string | null
  is_public: boolean
  github_repo_name: string | null
  github_repo_full_name: string | null
  github_repo_url: string | null
  vercel_project_id: string | null
  vercel_deploy_hook_url: string | null
  live_url: string | null
  target_launch: string | null
  roadmap: string[]
  tags: string[]
  created_at: string
  updated_at: string
}

export type ProjectRole = {
  id: string
  project_id: string
  role_title: string
  role_type: string
  description: string | null
  revenue_split: number
  filled: boolean
  filled_by: string | null
  created_at: string
}

export type Collaborator = {
  id: string
  project_id: string
  user_id: string
  role: string
  revenue_split: number
  status: string
  joined_at: string
}

export type JoinRequest = {
  id: string
  project_id: string
  requester_id: string
  status: string
  message: string | null
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  content: string
  project_id: string | null
  read: boolean
  created_at: string
}

export type WorkspaceUpdate = {
  id: string
  project_id: string
  user_id: string | null
  category: string
  title: string
  description: string | null
  source: string
  metadata: Json | null
  created_at: string
}

export type WorkspaceTerm = {
  id: string
  project_id: string
  created_by: string
  splits: Json
  accepted_by: string[]
  status: string
  created_at: string
}

export type Deploy = {
  id: string
  project_id: string
  vercel_deployment_id: string
  vercel_url: string | null
  status: string
  triggered_by: string | null
  source: string
  error_message: string | null
  created_at: string
  updated_at: string
}

export type ClankaFile = {
  id: string
  project_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}
