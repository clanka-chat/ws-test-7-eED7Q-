-- clanka.chat schema — all 10 tables + RLS + indexes

-- 1. profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  skills text[],
  roles text[],
  github_username text,
  stripe_connected boolean default false,
  stripe_account_id text,
  revenue_tier text,
  privacy_revenue boolean default true,
  privacy_projects boolean default true,
  privacy_activity boolean default true,
  api_key text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "profiles: public read"
  on profiles for select using (true);

create policy "profiles: own write"
  on profiles for update using (auth.uid() = id);

create policy "profiles: own insert"
  on profiles for insert with check (auth.uid() = id);

-- 2. projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  creator_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  stage text not null default 'idea',
  tech_stack text[],
  business_model text,
  domain_plan text,
  time_commitment text,
  timezone text,
  is_public boolean default true,
  github_repo_name text,
  github_repo_full_name text,
  github_repo_url text,
  vercel_project_id text,
  vercel_deploy_hook_url text,
  live_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table projects enable row level security;

create policy "projects: public read"
  on projects for select using (is_public = true);

create policy "projects: creator read own private"
  on projects for select using (auth.uid() = creator_id);

create policy "projects: creator insert"
  on projects for insert with check (auth.uid() = creator_id);

create policy "projects: creator update"
  on projects for update using (auth.uid() = creator_id);

create policy "projects: creator delete"
  on projects for delete using (auth.uid() = creator_id);

-- 3. project_roles
create table project_roles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  role_title text not null,
  role_type text not null,
  description text,
  revenue_split integer not null,
  filled boolean default false,
  filled_by uuid references profiles(id),
  created_at timestamptz default now()
);

alter table project_roles enable row level security;

create policy "project_roles: public read"
  on project_roles for select using (true);

create policy "project_roles: project creator write"
  on project_roles for insert with check (
    exists (select 1 from projects where projects.id = project_id and projects.creator_id = auth.uid())
  );

create policy "project_roles: project creator update"
  on project_roles for update using (
    exists (select 1 from projects where projects.id = project_id and projects.creator_id = auth.uid())
  );

create policy "project_roles: project creator delete"
  on project_roles for delete using (
    exists (select 1 from projects where projects.id = project_id and projects.creator_id = auth.uid())
  );

-- 4. collaborators
create table collaborators (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null,
  revenue_split integer not null,
  status text default 'active',
  joined_at timestamptz default now(),
  unique(project_id, user_id)
);

alter table collaborators enable row level security;

create policy "collaborators: project members read"
  on collaborators for select using (
    exists (select 1 from collaborators c where c.project_id = collaborators.project_id and c.user_id = auth.uid())
    or exists (select 1 from projects where projects.id = collaborators.project_id and projects.creator_id = auth.uid())
  );

create policy "collaborators: project creator write"
  on collaborators for insert with check (
    exists (select 1 from projects where projects.id = project_id and projects.creator_id = auth.uid())
  );

create policy "collaborators: project creator update"
  on collaborators for update using (
    exists (select 1 from projects where projects.id = project_id and projects.creator_id = auth.uid())
  );

create policy "collaborators: project creator delete"
  on collaborators for delete using (
    exists (select 1 from projects where projects.id = project_id and projects.creator_id = auth.uid())
  );

-- 5. join_requests
create table join_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  requester_id uuid references profiles(id) on delete cascade not null,
  status text default 'pending',
  message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, requester_id)
);

alter table join_requests enable row level security;

create policy "join_requests: requester read own"
  on join_requests for select using (auth.uid() = requester_id);

create policy "join_requests: project creator read"
  on join_requests for select using (
    exists (select 1 from projects where projects.id = project_id and projects.creator_id = auth.uid())
  );

create policy "join_requests: requester insert"
  on join_requests for insert with check (auth.uid() = requester_id);

create policy "join_requests: project creator update"
  on join_requests for update using (
    exists (select 1 from projects where projects.id = project_id and projects.creator_id = auth.uid())
  );

create policy "join_requests: requester update own"
  on join_requests for update using (auth.uid() = requester_id);

-- 6. messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  project_id uuid references projects(id),
  read boolean default false,
  created_at timestamptz default now()
);

create index idx_messages_conversation on messages(conversation_id, created_at);
create index idx_messages_receiver_unread on messages(receiver_id, read) where read = false;

alter table messages enable row level security;

create policy "messages: sender and receiver read"
  on messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "messages: sender insert"
  on messages for insert with check (auth.uid() = sender_id);

create policy "messages: receiver mark read"
  on messages for update using (auth.uid() = receiver_id);

-- 7. workspace_updates
create table workspace_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade,
  category text not null,
  title text not null,
  description text,
  source text default 'web',
  metadata jsonb,
  created_at timestamptz default now()
);

alter table workspace_updates enable row level security;

create policy "workspace_updates: collaborators read"
  on workspace_updates for select using (
    exists (select 1 from collaborators where collaborators.project_id = workspace_updates.project_id and collaborators.user_id = auth.uid())
    or exists (select 1 from projects where projects.id = workspace_updates.project_id and projects.creator_id = auth.uid())
  );

create policy "workspace_updates: collaborators insert"
  on workspace_updates for insert with check (
    exists (select 1 from collaborators where collaborators.project_id = project_id and collaborators.user_id = auth.uid())
    or exists (select 1 from projects where projects.id = project_id and projects.creator_id = auth.uid())
  );

-- 8. workspace_terms
create table workspace_terms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  created_by uuid references profiles(id) not null,
  splits jsonb not null,
  accepted_by uuid[],
  status text default 'proposed',
  created_at timestamptz default now()
);

alter table workspace_terms enable row level security;

create policy "workspace_terms: collaborators read"
  on workspace_terms for select using (
    exists (select 1 from collaborators where collaborators.project_id = workspace_terms.project_id and collaborators.user_id = auth.uid())
    or exists (select 1 from projects where projects.id = workspace_terms.project_id and projects.creator_id = auth.uid())
  );

create policy "workspace_terms: collaborators insert"
  on workspace_terms for insert with check (
    exists (select 1 from collaborators where collaborators.project_id = project_id and collaborators.user_id = auth.uid())
    or exists (select 1 from projects where projects.id = project_id and projects.creator_id = auth.uid())
  );

create policy "workspace_terms: collaborators update"
  on workspace_terms for update using (
    exists (select 1 from collaborators where collaborators.project_id = workspace_terms.project_id and collaborators.user_id = auth.uid())
    or exists (select 1 from projects where projects.id = workspace_terms.project_id and projects.creator_id = auth.uid())
  );

-- 9. deploys
create table deploys (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  vercel_deployment_id text not null,
  vercel_url text,
  status text default 'queued',
  triggered_by uuid references profiles(id),
  source text default 'manual',
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table deploys enable row level security;

create policy "deploys: collaborators read"
  on deploys for select using (
    exists (select 1 from collaborators where collaborators.project_id = deploys.project_id and collaborators.user_id = auth.uid())
    or exists (select 1 from projects where projects.id = deploys.project_id and projects.creator_id = auth.uid())
  );

create policy "deploys: collaborators insert"
  on deploys for insert with check (
    exists (select 1 from collaborators where collaborators.project_id = project_id and collaborators.user_id = auth.uid())
    or exists (select 1 from projects where projects.id = project_id and projects.creator_id = auth.uid())
  );

create policy "deploys: collaborators update"
  on deploys for update using (
    exists (select 1 from collaborators where collaborators.project_id = deploys.project_id and collaborators.user_id = auth.uid())
    or exists (select 1 from projects where projects.id = deploys.project_id and projects.creator_id = auth.uid())
  );

-- 10. clanka_files
create table clanka_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, user_id)
);

alter table clanka_files enable row level security;

create policy "clanka_files: own file read/write"
  on clanka_files for select using (auth.uid() = user_id);

create policy "clanka_files: collaborator read"
  on clanka_files for select using (
    exists (select 1 from collaborators where collaborators.project_id = clanka_files.project_id and collaborators.user_id = auth.uid())
    or exists (select 1 from projects where projects.id = clanka_files.project_id and projects.creator_id = auth.uid())
  );

create policy "clanka_files: own insert"
  on clanka_files for insert with check (auth.uid() = user_id);

create policy "clanka_files: own update"
  on clanka_files for update using (auth.uid() = user_id);
