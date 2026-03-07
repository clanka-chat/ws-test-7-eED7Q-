-- Add new project fields: target_launch, roadmap, tags
ALTER TABLE projects ADD COLUMN IF NOT EXISTS target_launch text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS roadmap text[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tags text[];
