-- Allow collaborators to read projects they are active members of.
-- Uses a SECURITY DEFINER function to avoid infinite recursion between
-- projects RLS and collaborators RLS (which references projects).

create or replace function public.is_project_collaborator(p_project_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from collaborators
    where collaborators.project_id = p_project_id
      and collaborators.user_id = p_user_id
      and collaborators.status = 'active'
  );
$$;

create policy "projects: collaborator read"
  on projects for select using (
    public.is_project_collaborator(id, auth.uid())
  );
