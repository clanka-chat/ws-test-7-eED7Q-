# clanka.chat — Hackathon Build Plan

**Date**: March 6, 2026
**Goal**: Demo-able MVP of clanka.chat
**Scope**: Full platform EXCEPT functioning Stripe Connect (mocked)
**Domain**: Already owned — replace existing project

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 15** (App Router) | RSC, API routes, SSR, file-based routing |
| Database | **Supabase** (PostgreSQL) | Hosted Postgres, realtime subscriptions, RLS |
| Auth | **Supabase Auth** | GitHub + Google OAuth, session management, RLS integration |
| Styling | **Tailwind CSS 4** | Utility-first, fast iteration, dark mode built-in |
| Fonts | **Satoshi** (via Fontsource) + **JetBrains Mono** | Per design-discovery.md |
| Platform Deploy | **Vercel** | Zero-config Next.js deploys for clanka.chat itself |
| Project Deploys | **Vercel API** | Platform-triggered deploys for user projects |
| Source Control | **GitHub App** on **GitHub Organization** | Platform-controlled repos per workspace |
| MCP Server | **TypeScript** + `@modelcontextprotocol/sdk` | Bridge between AI tools and clanka platform |
| Payments | **Stripe Connect** (MOCKED) | Express accounts, mock UI only for hackathon |
| File Storage | **Supabase Storage** | Avatars, project assets |
| Icons | **Lucide React** | Clean, consistent icon set |

### Not needed for hackathon
- Real-time messaging (polling is fine for v1)
- AI matching (post-v1)
- Canvas (Phase 3)
- Functioning Stripe payouts (mocked)

---

## MCP Server

### Overview
The MCP server is how vibecoders interact with clanka from their AI tools (Claude Code, Cursor, Windsurf). It's a TypeScript process that communicates via stdio and exposes tools the AI can call.

### Package: `@clanka/mcp-server`

**Dependencies:**
```json
{
  "@modelcontextprotocol/sdk": "latest",
  "zod": "^3.x"
}
```

### Tools (6 total)

#### 1. `list_projects`
**Description for AI**: "List all projects you're a member of on clanka.chat. Use this when the user wants to see their projects, check project statuses, or decide which workspace to work on. Returns project name, stage, role, team members, and deploy status."
**Annotations**: `readOnlyHint: true`
**Input Schema**: none (no parameters)
**API Call**: `GET /api/projects?mine=true`
**Returns**: Array of `{ slug, title, stage, role, team_count, deploy_status, live_url }`

#### 2. `view_workspace`
**Description for AI**: "Get full details of a clanka workspace including timeline of updates, team members, collaboration terms, deploy status, and GitHub repo info. Use this when the user wants to check on a specific project, see recent activity, or understand the current state of their workspace."
**Annotations**: `readOnlyHint: true`
**Input Schema**:
```json
{
  "slug": { "type": "string", "description": "The workspace slug (from list_projects or URL)" }
}
```
**API Call**: `GET /api/workspace/{slug}`
**Returns**: `{ title, description, stage, team[], timeline[], terms, deploy_status, live_url, github_repo_url }`

#### 3. `push_update`
**Description for AI**: "Post a progress update to a workspace timeline. Use this when the user has completed work, hit a milestone, wants to share what they built, or needs to communicate with their collaborator. Categories: 'progress' for work done, 'milestone' for key achievements, 'blocker' for issues, 'decision' for agreed changes."
**Input Schema**:
```json
{
  "slug": { "type": "string", "description": "The workspace slug" },
  "category": { "type": "string", "enum": ["progress", "milestone", "blocker", "decision"], "description": "Type of update" },
  "title": { "type": "string", "description": "Short summary of the update (max 120 chars)" },
  "description": { "type": "string", "description": "Detailed description of what was done or what's needed (markdown supported)" }
}
```
**API Call**: `POST /api/workspace/{slug}/updates`
**Returns**: `{ id, created_at }`

#### 4. `edit_clanka_md`
**Description for AI**: "Read or update YOUR CLANKA.md file for a workspace. Each collaborator has their own CLANKA.md — it's your AI's understanding of the project from your perspective. Use 'read' mode to understand the project context before starting work. Use 'write' mode to update your context after making changes. Use 'init' mode on first use to pull your CLANKA.md from the platform and write it locally."
**Input Schema**:
```json
{
  "slug": { "type": "string", "description": "The workspace slug" },
  "mode": { "type": "string", "enum": ["read", "write", "init"], "description": "Read your file, write updated content, or init (pull from platform and create local file)" },
  "content": { "type": "string", "description": "New markdown content for your CLANKA.md (required when mode is 'write')" }
}
```
**API Call**: `GET /api/workspace/{slug}/clanka-md` (read/init) or `PUT /api/workspace/{slug}/clanka-md` (write). API resolves to the authenticated user's CLANKA.md automatically.
**Returns**: `{ content, updated_at }` (read/init) or `{ updated_at }` (write)
**Side effect (init)**: MCP server writes `./CLANKA.md` to the user's current working directory.
**Side effect (write)**: MCP server updates local `./CLANKA.md` AND pushes to platform.

#### 5. `create_listing`
**Description for AI**: "Create a new project listing on clanka.chat and initialize your CLANKA.md file. Use this when the user wants to post a new project idea and find a collaborator. The listing will be visible on the Explore page. This also creates a CLANKA.md file in your current project directory with the project context."
**Input Schema**:
```json
{
  "title": { "type": "string", "description": "Project name (max 80 chars)" },
  "description": { "type": "string", "description": "What you want to build and why (markdown, 50-500 chars)" },
  "looking_for": { "type": "string", "description": "What kind of collaborator you need — skills, role, or expertise" },
  "tags": { "type": "array", "items": { "type": "string" }, "description": "1-5 topic tags (e.g. 'ai', 'saas', 'mobile')" }
}
```
**API Call**: `POST /api/projects`
**Returns**: `{ slug, url, clanka_md_path }` — `clanka_md_path` is the local file path where CLANKA.md was created
**Side effect**: MCP server creates `./CLANKA.md` in the user's current working directory, populated from listing data + inferred local project context (CLAUDE.md, package.json, README if present). Also stored on platform.

#### 6. `deploy`
**Description for AI**: "Trigger a Vercel deployment for a workspace project. Use this when the user wants to deploy their latest code to production. The deployment uses the latest code on the main branch of the GitHub repo. Returns immediately with a deploy ID — the actual build takes 30-120 seconds."
**Input Schema**:
```json
{
  "slug": { "type": "string", "description": "The workspace slug" }
}
```
**API Call**: `POST /api/workspace/{slug}/deploy`
**Returns**: `{ deploy_id, status: "queued", message: "Deployment triggered. Check status with view_workspace." }`

### Tool Design Principles (MCP Spec 2025-11-25)

- **Descriptions are for the AI, not the user.** They tell the model *when* to use the tool. Be specific about triggers ("when the user wants to...").
- **Underscore naming.** MCP clients display as `mcp__clanka__list_projects` — underscores read better than hyphens in this context.
- **Every property has a description.** This is how the AI knows what to fill in.
- **`readOnlyHint` annotation** on read-only tools — tells the AI it's safe to call without confirmation.
- **Errors use `isError: true`** in the result, with a human-readable message. Never expose raw API errors or stack traces.
- **Return only what the AI needs.** Don't dump entire database rows — curate the response for the AI's decision-making.

### Error Handling Pattern

```typescript
// Tool execution errors — returned as results, not thrown
{
  content: [{ type: "text", text: "You don't have access to workspace 'xyz'. Check slug with list_projects." }],
  isError: true
}

// Common error responses:
// 401 → "API key is invalid or expired. Generate a new one at clanka.chat/settings."
// 403 → "You're not a member of this workspace."
// 404 → "Workspace '{slug}' not found. Use list_projects to see your workspaces."
// 429 → "Rate limit reached. Try again in a few seconds."
// 500 → "Something went wrong on our end. Try again."
```

### Auth
- User provides their **clanka API key** as an environment variable when adding the MCP server
- API key stored in `profiles` table, generated in Settings
- Each MCP tool call includes the key in the `Authorization: Bearer ck_xxx` header
- Server validates key → resolves to user → checks permissions
- **Key format**: `ck_` prefix + 32 random hex chars (e.g. `ck_a1b2c3d4e5f6...`)
- **One key per user.** Regenerating invalidates the old one immediately.

### User Setup
```bash
# Install
npm install -g @clanka/mcp-server

# Add to Claude Code
claude mcp add clanka -e CLANKA_API_KEY=ck_xxx -- npx @clanka/mcp-server

# Add to Cursor (.cursor/mcp.json)
{
  "mcpServers": {
    "clanka": {
      "command": "npx",
      "args": ["@clanka/mcp-server"],
      "env": { "CLANKA_API_KEY": "ck_xxx" }
    }
  }
}
```

### Architecture
```
AI Tool (Claude Code / Cursor / Windsurf)
  ↕ stdio (JSON-RPC 2.0)
MCP Server (@clanka/mcp-server)
  ↕ HTTPS
clanka.chat API (/api/*)
  ↕
Supabase (data) + GitHub API (repos) + Vercel API (deploys)
```

### File Structure
```
packages/mcp-server/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts          # ~300-400 lines: McpServer + 6 tool handlers
```

### Implementation Skeleton (`src/index.ts`)
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = "https://clanka.chat/api";
const API_KEY = process.env.CLANKA_API_KEY;

if (!API_KEY) {
  console.error("CLANKA_API_KEY environment variable is required");
  process.exit(1);
}

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${msg}`);
  }
  return res.json();
}

const server = new McpServer({
  name: "clanka",
  version: "1.0.0",
});

// --- Tools ---

server.tool(
  "list_projects",
  "List all projects you're a member of on clanka.chat. Use this when the user wants to see their projects, check project statuses, or decide which workspace to work on.",
  {},  // no inputs
  async () => {
    try {
      const data = await api("/projects?mine=true");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: e.message }], isError: true };
    }
  }
);

server.tool(
  "view_workspace",
  "Get full details of a clanka workspace including timeline, team, terms, deploy status, and GitHub repo. Use when checking on a specific project or seeing recent activity.",
  { slug: z.string().describe("The workspace slug (from list_projects or URL)") },
  async ({ slug }) => {
    try {
      const data = await api(`/workspace/${slug}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: e.message }], isError: true };
    }
  }
);

server.tool(
  "push_update",
  "Post a progress update to a workspace timeline. Use when the user completed work, hit a milestone, or needs to communicate with their collaborator.",
  {
    slug: z.string().describe("The workspace slug"),
    category: z.enum(["progress", "milestone", "blocker", "decision"]).describe("Type of update"),
    title: z.string().max(120).describe("Short summary (max 120 chars)"),
    description: z.string().describe("Detailed description (markdown supported)"),
  },
  async ({ slug, category, title, description }) => {
    try {
      const data = await api(`/workspace/${slug}/updates`, {
        method: "POST",
        body: JSON.stringify({ category, title, description }),
      });
      return { content: [{ type: "text", text: `Update posted: ${data.id}` }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: e.message }], isError: true };
    }
  }
);

// ... edit_clanka_md, create_listing, deploy follow same pattern

// --- Start ---
const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## CLANKA.md (Per-Collaborator Context File)

### What It Is
CLANKA.md is a **per-collaborator** context file for a project. Each collaborator has their own CLANKA.md — it's their AI's understanding of the project from their perspective. Think of it as a work journal that the AI maintains automatically.

**One CLANKA.md per collaborator per project.** A 2-person workspace has 2 CLANKA.md files.

### Where It Lives — Two Places
1. **Locally** — in the collaborator's project directory (e.g. `./CLANKA.md`). The MCP server writes this file during `create_listing`. The user's AI reads it for context.
2. **On the platform** — in Supabase (`clanka_files` table). Synced via MCP on every update.

### Lifecycle

**1. Created during `create_listing` (creator's CLANKA.md):**
When a user creates a listing via MCP, two things happen:
- The MCP server creates a `CLANKA.md` file in the user's **local project directory**
- The API stores it on the platform

The initial content is generated from listing data + whatever the AI can infer from local project files (CLAUDE.md, package.json, README, etc.):
```markdown
# {project title}
## Role: Creator
## About
{project description}
## Looking For
{looking_for}
## Stack
{inferred from local files or user input}
## Status
Listing created, looking for collaborator.
## My Contributions
(none yet)
## Decisions
(none yet)
```

**2. Collaborator's CLANKA.md created when they join:**
When a collaborator accepts terms and the workspace is created, the platform generates their CLANKA.md (and the MCP server writes it locally when they first call `edit_clanka_md` with `mode: "init"`).

**3. Updated automatically on every contribution:**
Every time a collaborator does work — code push, marketing update, milestone, decision — their CLANKA.md gets updated. The flow:
- User's AI does work → calls `push_update` → platform appends to that user's CLANKA.md "Recent Changes" section
- User's AI can also call `edit_clanka_md` with `mode: "write"` to do a full rewrite (e.g. after a big refactor, the AI re-summarizes the project state)
- The local file and platform copy stay in sync via MCP

**4. Kept in sync:**
- **Local → Platform**: Every `edit_clanka_md(write)` call pushes the local content to the platform
- **Platform → Local**: Every `edit_clanka_md(read)` call pulls the latest from the platform (in case it was updated via web UI or auto-appended by the platform)

### Visibility in Workspace
- Each collaborator sees **their own** CLANKA.md by default in the workspace
- **Cross-visibility depends on terms**: If terms grant full transparency, both can see each other's. If not (e.g. code access restricted), each sees only their own.
- The workspace CLANKA.md tab shows: "Your CLANKA.md" (always) + "Collaborator's CLANKA.md" (if terms allow)

### Why Per-Collaborator (Not Shared)
- A coder's CLANKA.md talks about code architecture, tech debt, API design
- A marketer's CLANKA.md talks about campaigns, conversion rates, content calendar
- They're working on the same project but their AI context is completely different
- Each AI maintains the file relevant to its user's role and contributions
- The platform can still aggregate both into a unified project view

### Database
```sql
-- Replaces the old projects.clanka_md column
create table clanka_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,                -- markdown
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, user_id)           -- one per collaborator per project
);
```

---

## GitHub Integration

### Architecture
- **GitHub Organization**: `clanka-projects` (created pre-hackathon)
- **GitHub App**: Installed on the org, manages all repos programmatically
- When a workspace is created → platform creates a private repo under the org → adds collaborators

### Branching Strategy
**Hackathon: main-only.** All collaborators push directly to `main`. Reasons:
- These are 2-person micro-projects, not enterprise codebases
- Vibecoders using AI tools push directly (AI generates → commit → push)
- Vercel auto-deploys on push to `main` — simplest, most reliable flow
- Branch protection / PR workflows are post-v1 features

Both collaborators have **write access** to the repo. No branch rules enforced.

### GitHub App Permissions
| Permission | Access | Why |
|-----------|--------|-----|
| Repository > Administration | Read & Write | Create repos, manage collaborators |
| Repository > Contents | Read & Write | Read code, commits |
| Repository > Pull requests | Read | Track PRs in workspace |
| Repository > Webhooks | Read & Write | Receive push/PR events |

### GitHub App Webhook Events
| Event | Use |
|-------|-----|
| `push` | Track commits → show in workspace timeline |
| `pull_request` | Track PRs → show in workspace Code tab |
| `deployment_status` | Update deploy status in workspace |

### Webhook Handler
```
POST /api/github/webhooks → receives all events
  → verifies signature with webhook secret
  → routes to handlers:
    push → insert into workspace_updates (source: 'github')
    pull_request → insert into workspace_updates
    deployment_status → update deploys table
```

### Flow: Workspace Creation → Repo

**Prerequisites (checked before workspace creation):**
- Both parties: Stripe connected (or mocked for hackathon)
- Code-access collaborators: `github_username` set in Settings
- If a collaborator is marked as code-access in terms but hasn't set their GitHub username → block workspace creation with: "Your collaborator needs to add their GitHub username in Settings before the workspace can be created."

```
1. Creator proposes terms (includes who gets code access), collaborator accepts
2. Platform checks prerequisites:
   - Both Stripe connected? ✓
   - All code-access collaborators have github_username? ✓
3. Platform creates workspace record in Supabase
4. Platform calls GitHub API:
   a. Create private repo: POST /orgs/clanka-projects/repos
   b. Add creator as collaborator: PUT /repos/.../collaborators/{github_username}
   c. Add code-access collaborators: PUT /repos/.../collaborators/{github_username}
   d. Initialize with README containing project info
5. Store repo details in projects table (github_repo_name, github_repo_url)
6. Create Vercel project linked to this repo (see Deploy section)
```

### NPM Packages
```json
{
  "octokit": "^4.x",
  "@octokit/app": "^15.x",
  "@octokit/webhooks": "^13.x"
}
```

### Database Additions for GitHub

Added to `projects` table:
```sql
alter table projects add column github_repo_name text;        -- 'ws-project-slug-abc123'
alter table projects add column github_repo_full_name text;   -- 'clanka-projects/ws-project-slug-abc123'
alter table projects add column github_repo_url text;         -- 'https://github.com/clanka-projects/ws-...'
```

Added to `profiles` table:
```sql
alter table profiles add column api_key text unique;          -- 'ck_...' for MCP auth
-- github_username already in base schema (see Updated Database Schema)
-- Required for code-access collaborators before workspace creation
```

---

## Vercel Deploy Integration

### How It Works
Each workspace project gets a Vercel project linked to its GitHub repo. Pushes to `main` auto-deploy. Users can also trigger manual deploys from the workspace UI or via MCP.

### Flow
```
1. Workspace created → GitHub repo created
2. Platform calls Vercel API: create project linked to GitHub repo
3. Vercel installs its GitHub App on the repo (auto via API)
4. Every push to main → Vercel auto-deploys
5. Manual deploy: user clicks "Deploy" in workspace or uses MCP `deploy` tool
   → Platform calls Vercel Deploy Hook URL (POST, no auth needed)
6. Platform polls Vercel API for deploy status
7. Workspace shows: "Deploying..." → "Live at https://xxx.vercel.app"
```

### Vercel API Calls

| Action | Method | Endpoint |
|--------|--------|----------|
| Create project (linked to GitHub repo) | `POST` | `/v10/projects` |
| Create Deploy Hook | `POST` | `/v10/projects/{projectId}/deploy-hooks` |
| Trigger deploy via hook | `POST` | Deploy Hook URL (no auth) |
| Get deploy status | `GET` | `/v13/deployments/{id}` |
| List deploys | `GET` | `/v6/deployments?projectId={id}` |

### Deploy States (shown in workspace)
| Vercel State | UI Display |
|-------------|-----------|
| `QUEUED` | "Queued..." |
| `BUILDING` | "Deploying..." |
| `READY` | "Live" + URL link |
| `ERROR` | "Failed" + error message |
| `CANCELED` | "Canceled" |

### Auth
- **Vercel API Token**: Generated from Vercel dashboard, stored as env var
- Used server-side only — never exposed to client
- Single token for all platform operations
- **Vercel Hobby (free) for hackathon** — 200 projects, 100 deploys/day, 1 concurrent build. Plenty for demo day. Upgrade to Pro ($20/mo) when commercial activity starts.

### Database Additions for Deploys

New table:
```sql
create table deploys (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  vercel_deployment_id text not null,
  vercel_url text,               -- 'xxx.vercel.app'
  status text default 'queued',  -- 'queued', 'building', 'ready', 'error', 'canceled'
  triggered_by uuid references profiles(id),
  source text default 'manual',  -- 'manual', 'push', 'mcp'
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Added to `projects` table:
```sql
alter table projects add column vercel_project_id text;
alter table projects add column vercel_deploy_hook_url text;
alter table projects add column live_url text;                -- current live deploy URL
```

---

## Updated Database Schema (Complete)

### `profiles`
```sql
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
  api_key text unique,                    -- MCP auth key
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### `projects`
```sql
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
  -- GitHub integration
  github_repo_name text,
  github_repo_full_name text,
  github_repo_url text,
  -- Vercel integration
  vercel_project_id text,
  vercel_deploy_hook_url text,
  live_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### `project_roles`
```sql
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
```

### `collaborators`
```sql
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
```

### `join_requests`
```sql
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
```

### `messages`
```sql
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
```

### `workspace_updates`
```sql
create table workspace_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade,  -- nullable for system events
  category text not null,  -- 'code', 'marketing', 'management', 'general', 'milestone', 'deploy'
  title text not null,
  description text,
  source text default 'web',  -- 'web', 'mcp', 'github', 'vercel'
  metadata jsonb,             -- flexible: commit SHA, PR number, deploy URL, etc.
  created_at timestamptz default now()
);
```

### `workspace_terms`
```sql
create table workspace_terms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  created_by uuid references profiles(id) not null,
  splits jsonb not null,
  accepted_by uuid[],
  status text default 'proposed',
  created_at timestamptz default now()
);
```

### `deploys`
```sql
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
```

### `clanka_files`
```sql
create table clanka_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,                -- markdown
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, user_id)           -- one per collaborator per project
);
```

### RLS Summary
- `profiles`: public read, own write
- `projects`: public read (where is_public), creator write
- `project_roles`: public read, project creator write
- `collaborators`: project members read, project creator write
- `join_requests`: requester + project creator read/write
- `messages`: sender + receiver only
- `workspace_updates`: project collaborators only
- `workspace_terms`: project collaborators only
- `deploys`: project collaborators read, collaborators + system write
- `clanka_files`: own file read/write, collaborator's file read (if terms allow)

---

## API Routes (Complete)

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/auth/callback` | OAuth callback handler (Supabase Auth) |
| POST | `/auth/signout` | Sign out |

### Profiles
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/profiles/[username]` | Get public profile |
| PATCH | `/api/profiles/me` | Update own profile |
| GET | `/api/profiles/me` | Get current user profile |
| POST | `/api/profiles/me/api-key` | Generate MCP API key |

### Projects
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/projects` | List projects (with filters, `?mine=true` for own) |
| POST | `/api/projects` | Create new project listing |
| GET | `/api/projects/[slug]` | Get project details |
| PATCH | `/api/projects/[slug]` | Update project (creator only) |
| DELETE | `/api/projects/[slug]` | Delete project (creator only) |

### Project Roles
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/projects/[slug]/roles` | Add role to project |
| PATCH | `/api/projects/[slug]/roles/[id]` | Update role |
| DELETE | `/api/projects/[slug]/roles/[id]` | Remove role |

### Join Requests
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/projects/[slug]/join` | Send join request |
| GET | `/api/projects/[slug]/requests` | List requests (creator) |
| PATCH | `/api/join-requests/[id]` | Accept/reject request |

### Messages
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/messages` | List conversations (inbox) |
| GET | `/api/messages/[conversationId]` | Get messages in conversation |
| POST | `/api/messages` | Send message |
| PATCH | `/api/messages/read` | Mark messages as read |

### Workspace
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/workspace/[slug]` | Get full workspace (timeline, team, terms, deploy status) |
| GET | `/api/workspace/[slug]/timeline` | Get workspace timeline |
| POST | `/api/workspace/[slug]/updates` | Add workspace update |
| GET | `/api/workspace/[slug]/terms` | Get terms |
| POST | `/api/workspace/[slug]/terms` | Propose terms |
| PATCH | `/api/workspace/[slug]/terms/[id]/accept` | Accept terms |
| GET | `/api/workspace/[slug]/clanka-md` | Get CLANKA.md content |
| PUT | `/api/workspace/[slug]/clanka-md` | Update CLANKA.md (MCP only in practice) |
| GET | `/api/workspace/[slug]/commits` | Get commit history from GitHub |
| GET | `/api/workspace/[slug]/deploys` | Get deploy history |
| POST | `/api/workspace/[slug]/deploy` | Trigger Vercel deploy |

### GitHub Webhooks
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/github/webhooks` | Receive push, PR, deploy events |

### Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/dashboard` | User's projects, requests, earnings summary |
| GET | `/api/dashboard/notifications` | Recent activity |

### Stripe (MOCKED)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/stripe/connect` | Mock: set stripe_connected = true |
| GET | `/api/stripe/status` | Mock: return connection status |
| GET | `/api/stripe/earnings` | Mock: return fake earnings data |

---

## Page Routes (Next.js App Router)

```
app/
├── page.tsx                          # Landing page (/)
├── explore/page.tsx                  # Browse projects (/explore)
├── new/page.tsx                      # Create listing (/new) [auth required]
├── login/page.tsx                    # Login (/login)
├── signup/page.tsx                   # Signup (/signup)
├── auth/callback/route.ts           # OAuth callback
├── dashboard/page.tsx               # Dashboard (/dashboard) [auth required]
├── messages/page.tsx                 # Inbox (/messages) [auth required]
├── messages/[id]/page.tsx           # Conversation (/messages/[id])
├── u/[username]/page.tsx            # Public profile (/u/[username])
├── project/[slug]/
│   ├── page.tsx                     # Project page (or modal from explore)
│   └── workspace/page.tsx           # Workspace (/project/[slug]/workspace) [auth + collab]
├── settings/page.tsx                # Settings (/settings) [auth required]
├── about/page.tsx                   # About (/about)
├── terms/page.tsx                   # Terms of service
├── privacy/page.tsx                 # Privacy policy
└── api/                             # API routes (see above)
```

---

## Project Slug Format

A **slug** is a URL-friendly identifier for a project. It appears in URLs like `/project/vibetunes-a3f8k2/workspace`.

**Format:** `slugify(name)-nanoid(6)`

**Examples:**
- "VibeTunes" → `vibetunes-k8m2x4`
- "My Cool App!!!" → `my-cool-app-p3r7n1`
- "ShipKit" → `shipkit-w9d5j6`

**Rules:**
- Lowercase, hyphens only (no spaces, no special chars)
- 6-char random suffix (nanoid) ensures uniqueness even if two projects have the same name
- Generated once at creation, never changes
- Used in URLs, API calls, MCP tool parameters

**Dependencies:**
```bash
npm install nanoid slugify
# or: import { nanoid } from 'nanoid'; import slugify from 'slugify';
```

---

## Environment Variables

All env vars needed for the hackathon. Add these to `.env.local` and Vercel project settings.

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # server-side only, never expose to client
```

### GitHub App
```
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA..."  # multi-line, wrap in quotes
GITHUB_APP_INSTALLATION_ID=12345678
GITHUB_APP_WEBHOOK_SECRET=whsec_xxx
```

### Vercel
```
VERCEL_API_TOKEN=xxx                       # from Vercel dashboard > Settings > Tokens
```

### App
```
NEXT_PUBLIC_APP_URL=https://clanka.chat    # or http://localhost:3000 in dev
```

**Total: 9 env vars.** All server-side except the two `NEXT_PUBLIC_` ones.

**Where to set them:**
- **Local dev:** `.env.local` (gitignored)
- **Production:** Vercel project settings > Environment Variables
- **MCP server:** `CLANKA_API_KEY` is set by the user, not by us — it's their personal key

---

## Supabase Client Pattern

### Two clients for Next.js 15 App Router

**1. Server-side client** — used in Server Components, API routes, Server Actions:
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — cookies are read-only
          }
        },
      },
    }
  )
}
```

**2. Browser client** — used in Client Components:
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**3. Service role client** — used in API routes that need admin access (bypasses RLS):
```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

**Usage pattern:**
```typescript
// Server Component
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // ... use supabase with the user's session (RLS applied)
}

// API Route
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // ...
}

// Admin operation (e.g., GitHub webhook handler — no user session)
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  // Verify GitHub signature first...
  await supabaseAdmin.from('workspace_updates').insert({ ... })
}
```

**NPM package:** `@supabase/ssr` (replaces the old `@supabase/auth-helpers-nextjs`)

---

## Auth Middleware

Protects routes that require authentication. Uses Supabase session from cookies.

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require auth
const protectedPaths = [
  '/dashboard',
  '/settings',
  '/messages',
  '/new',           // create listing
]

// Routes that require auth + collaborator access (checked in page, not middleware)
// /project/[slug]/workspace — auth checked here, collaborator access checked in page

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )
  const isWorkspace = request.nextUrl.pathname.match(/^\/project\/[^/]+\/workspace/)

  if ((isProtected || isWorkspace) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/github/webhooks|auth/callback).*)',
  ],
}
```

**What it does:**
- Refreshes the Supabase session on every request (prevents stale cookies)
- Redirects to `/login?redirect=...` if unauthenticated user hits a protected route
- Excludes: static files, images, GitHub webhook endpoint, auth callback
- Does NOT check collaborator permissions — that happens in the page/API route itself

---

## Hackathon Build Order

### Phase 1: Foundation (~2 hours)
1. **Init project** — `npx create-next-app@latest clanka-chat --typescript --tailwind --app`
2. **Set up Supabase** — Create project, configure env vars
3. **Database schema** — Run all SQL migrations (9 tables)
4. **Supabase Auth** — Configure GitHub + Google OAuth providers
5. **Auth flow** — Login/signup pages, callback handler, session provider
6. **Tailwind config** — Design tokens from design-discovery.md (colors, fonts, spacing)
7. **Layout shell** — Nav bar (logged out + logged in states), footer, page layout

### Phase 2: Core Pages (~2.5 hours)
8. **Landing page** — Hero, how it works, what platform handles, FAQ, pricing section, footer CTA
9. **Explore page** — Project card grid with filters, search
10. **Create listing** — Form with all fields from website-structure.md
11. **Project page** — Full project detail view (modal from explore + standalone page)

### Phase 3: User Features (~2 hours)
12. **Profile page** — `/u/[username]` — avatar, bio, skills, project cards
13. **Dashboard** — Active projects, pending requests, earnings summary (mocked)
14. **Settings** — Profile editing, connected accounts, privacy toggles, **API key generation for MCP**, **GitHub username** (required for code-access collaborators)
15. **Join request flow** — "Request to Join" button → pending state → creator notification

### Phase 4: Collaboration Core (~2.5 hours)
16. **Messages** — Inbox list, conversation view, send messages, unread indicators
17. **Terms flow** — Creator proposes terms (splits), collaborator accepts
18. **Workspace creation** — On terms acceptance: create workspace record + **GitHub repo** + **Vercel project**
19. **Workspace — Timeline** — Activity feed showing web updates, GitHub commits, deploys
20. **Workspace — Tabs** — Work (Code: commits + PRs + deploy button, Marketing, Management, General), Money (split bar, mocked earnings), CLANKA.md viewer

### Phase 5: Integrations (~2 hours)
21. **GitHub webhook handler** — Receive push/PR events, insert into workspace_updates
22. **Deploy flow** — "Deploy" button in workspace → trigger Vercel deploy hook → poll status → show live URL
23. **MCP server** — Build `@clanka/mcp-server` with 6 tools, test with Claude Code
24. **Workspace Code tab** — Show real commit history from GitHub API, deploy history

### Phase 6: Polish & Demo Prep (~2 hours)
25. **Revenue split bar** — Signature visual element on project cards, workspace, profile
26. **Empty states** — All workspace sections, dashboard states per website-structure.md
27. **Mock Stripe** — "Connect Stripe" button that toggles state, fake earnings display
28. **Seed data** — 3-5 demo projects with varied states, 2-3 demo users
29. **Responsive pass** — Mobile layout fixes
30. **Loading states** — Skeleton screens for cards, pages
31. **Final walkthrough** — Test all flows end-to-end, test MCP from Claude Code

---

## Demo Flow (for judges)

1. **Landing page** — Show the value prop, scroll through sections
2. **Sign up** — OAuth with GitHub
3. **Browse explore** — Show project cards, filters
4. **View a project** — Click into a listing, see details + revenue split bar
5. **Create a listing** — Post a new project in ~60 seconds
6. **Request to join** — Show the join request flow
7. **Messages** — Show the private chat starting from a request
8. **Accept + Terms** — Creator accepts, proposes terms with revenue splits
9. **Workspace** — Show timeline with GitHub commits, deploy status, work tabs
10. **Deploy** — Click "Deploy" → watch it go live → show the live URL
11. **MCP demo** — Switch to Claude Code/Cursor, show `push-update` and `deploy` working from the terminal
12. **Profile** — Show project grid, skills, reputation tier badge
13. **Dashboard** — Show cross-project view with earnings summary

**Key talking points:**
- "Find a co-builder, ship a product, split the revenue"
- Not a marketplace — a community with infrastructure
- Revenue flows through platform (5% fee), automatic splits
- Works for ALL vibecoders — not just coders
- **MCP bridge** — vibecoders work in their AI tools, everything syncs to the platform
- **Real collaboration** — platform creates repos, manages access, deploys code
- This platform is itself listed as a project on clanka (dogfooding)

---

## Key Design Tokens (Tailwind Config)

```js
// tailwind.config.ts — extend theme
colors: {
  bg: {
    base: '#0A0A0B',
    surface: '#141415',
    elevated: '#1C1C1E',
    input: '#0F0F10',
  },
  text: {
    primary: '#EDEDEF',
    heading: '#FFFFFF',
    secondary: '#A0A0A5',
    muted: '#666668',
  },
  accent: {
    DEFAULT: '#F59E0B',
    hover: '#FBBF24',
    muted: 'rgba(245, 158, 11, 0.15)',
  },
  border: {
    DEFAULT: 'rgba(255, 255, 255, 0.08)',
    subtle: 'rgba(255, 255, 255, 0.04)',
    strong: 'rgba(255, 255, 255, 0.15)',
  },
  status: {
    success: '#22C55E',
    error: '#EF4444',
    info: '#3B82F6',
  },
},
fontFamily: {
  sans: ['Satoshi', ...defaultTheme.fontFamily.sans],
  mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
},
borderRadius: {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
},
boxShadow: {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 12px rgba(0, 0, 0, 0.25)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.3)',
},
```

---

## Seed Data Ideas (for demo)

### Projects
1. **clanka.chat** — "The platform itself. Looking for a frontend dev and a growth marketer." Stage: building. Creator: you. Has workspace with real commits.
2. **VibeTunes** — "AI-powered playlist curator for indie artists." Stage: idea. Needs: code, marketing.
3. **ShipKit** — "Boilerplate generator for vibecoded apps." Stage: needs-help. Needs: code (backend).
4. **PixelPay** — "Micropayment system for digital art." Stage: launched. Has revenue (mocked). Has live deploy URL.
5. **GrowthBot** — "Automated social media scheduling with AI captions." Stage: building. Needs: marketing.

### Users
- Your real account (project creator for clanka.chat)
- 2-3 mock users with different skill sets and project histories

---

## What's Mocked vs Real

| Feature | Status |
|---------|--------|
| Auth (GitHub + Google OAuth) | **REAL** |
| Database (all tables) | **REAL** |
| Project CRUD | **REAL** |
| Explore + filters | **REAL** |
| Join requests | **REAL** |
| Messages (polling) | **REAL** |
| Workspace timeline | **REAL** |
| Profile + settings | **REAL** |
| MCP server (6 tools) | **REAL** |
| GitHub integration (repos, collaborators, commits) | **REAL** |
| Vercel deploy (trigger, status, live URL) | **REAL** |
| CLANKA.md (view on web, edit via MCP) | **REAL** |
| API key generation for MCP | **REAL** |
| Stripe Connect | **MOCKED** — button toggles state, fake earnings |
| Revenue payouts | **MOCKED** — display only |
| Real-time messaging | **NOT INCLUDED** — polling works for v1 |
| AI matching | **NOT INCLUDED** — post-v1 |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| GitHub App setup takes too long | Register and install pre-hackathon. Test with one manual repo creation. |
| Vercel API integration is flaky | Fall back to Deploy Hooks (simpler). Pre-test a deploy before hackathon. |
| MCP server eats too much time | Build MCP last (Phase 5). Workspace works without it — MCP is the "wow" demo. |
| OAuth setup takes too long | Pre-configure all Supabase auth providers before hackathon |
| Running out of time on workspace | Timeline + Code tab + Deploy are must-haves. Marketing/Management/General can be empty states. |
| Design polish takes too long | Stick to Tailwind utilities. Design tokens handle the look. |
| RLS policies are complex | Start with basic policies, tighten later |
| Too many API routes | Workspace and GitHub/Vercel routes are the differentiators. Messages and settings can be bare minimum. |

---

## Pre-Hackathon Checklist (tonight)

### Accounts & Services
- [ ] Supabase project created, env vars noted
- [ ] GitHub OAuth app registered in Supabase Auth config
- [ ] Google OAuth credentials created in Supabase Auth config
- [ ] **GitHub Organization created** (e.g., `clanka-projects`)
- [ ] **GitHub App registered** with correct permissions (see GitHub Integration section)
- [ ] **GitHub App installed on the org**
- [ ] **GitHub App private key downloaded** and stored securely
- [ ] **Vercel API token generated** (Settings > Tokens in Vercel dashboard)
- [ ] Domain DNS pointed to Vercel (or ready to point)

### Test Runs
- [ ] Test Supabase Auth login flow (GitHub + Google)
- [ ] Test GitHub App: create a repo under org via API
- [ ] Test GitHub App: add a collaborator to a repo
- [ ] Test Vercel API: create a project linked to a GitHub repo
- [ ] Test Vercel: push to repo → auto-deploy works

### Environment Variables
- [ ] `.env.local` created with all 9 env vars (see Environment Variables section)
- [ ] Supabase URL + anon key + service role key copied from Supabase dashboard
- [ ] GitHub App ID, private key, installation ID, webhook secret saved
- [ ] Vercel API token generated and saved
- [ ] `NEXT_PUBLIC_APP_URL` set to `http://localhost:3000` for dev

### Assets
- [ ] Satoshi font files downloaded / Fontsource package identified
- [ ] JetBrains Mono available (Google Fonts or npm)

### Reference Docs
- [ ] This plan open on second screen
- [ ] design-discovery.md open for reference
- [ ] website-structure.md open for reference
- [ ] project-outline-v1.md open for reference
