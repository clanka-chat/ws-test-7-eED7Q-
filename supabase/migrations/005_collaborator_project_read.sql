-- Allow collaborators to read projects they are active members of
create policy "projects: collaborator read"
  on projects for select using (
    exists (
      select 1 from collaborators
      where collaborators.project_id = projects.id
        and collaborators.user_id = auth.uid()
        and collaborators.status = 'active'
    )
  );
