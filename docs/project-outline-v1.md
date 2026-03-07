# Project Outline v1: clanka.chat

**Status**: First Draft (updated March 5 with architecture decisions + new sections)
**Date**: March 2-5, 2026
**Based on**: 8 research phases, 10+ parallel research agents, 60+ sources

---

## 1. WHAT IS IT

A community platform where vibecoders find each other and build micro-startups together — with shared infrastructure that handles repos, deployments, revenue splitting, and project management automatically.

**One-liner**: "Find a co-builder, ship a product, split the revenue."

### Core Principles

1. **People keep working where they work** — IDE, terminal, OpenClaw, browser. Nobody moves to a new tool.
2. **Protection disguised as service** — Revenue flows through the platform, contributions are tracked automatically. No contracts needed.
3. **Not just code** — Marketing, management, design, content. Everything vibecoders do can be organized here.
4. **Community, not marketplace** — Works with 5 people. No cold-start problem. Grows organically.
5. **Async by default** — No scheduled sessions. People work on their own time and push updates.
6. **Revenue from day 1** — 5% cut on revenue that flows through the platform via Stripe Connect.

---

## 2. WHO IS IT FOR

### Primary Users: Vibecoders

People who build software/products using AI tools. Four segments:

| Segment | Tools | Size | Our Access Point |
|---------|-------|------|-----------------|
| IDE vibecoders | Cursor, Windsurf, VS Code + Copilot | Largest (Cursor 1M+ DAU) | VS Code extension, MCP |
| Terminal vibecoders | Claude Code, Aider | Power users | MCP, CLI |
| Browser builders | Replit, Bolt, Lovable | Non-technical | Web dashboard |
| Messaging coders | OpenClaw via WhatsApp/Telegram | Growing | MCP via OpenClaw skill |

### What They Do Today

- Build solo, ship solo, struggle solo
- Ask for help in Reddit/Discord communities when stuck
- Show off what they built ("look what I made")
- Prototype → get stuck at the last 20% → hire someone on Fiverr to finish
- No tools exist for the handoff flow ("I'm stuck, help me finish this")

### Why They'd Use This

1. **The Last 20% Problem** — "I built 80% of this app but can't figure out deployment/auth/payments"
2. **Accountability** — Someone else is counting on you to ship
3. **Complementary taste** — "I'm good at building, you're good at marketing"
4. **Speed** — Two vibecoders with AI can ship in days what used to take months
5. **Loneliness** — Solo building is isolating. Building together is fun.
6. **Revenue opportunity** — Micro-startups that actually make money

---

## 3. PLATFORM COMPONENTS

### 3.1 Web Dashboard (The Hub)

The central place where everything comes together.

**What it shows:**
- **Project Feed** — Browse projects looking for collaborators. Filter by type (code, marketing, design), stage (idea, in-progress, needs-help), tech stack.
- **Project Pages** — Each project has a dashboard showing: description, team, current status, GitHub activity, deployment status, revenue (if earning), contribution history.
- **User Profiles** — What you've built, what you're good at, your contribution history across projects.
- **Project Workspace** — Organized sections for different types of work:
  - **Code** — Linked to GitHub repo. Shows commits, PRs, deployment status.
  - **Marketing** — Tasks, copy, assets, social media plans.
  - **Management** — Milestones, decisions log, revenue tracking.
  - **General** — Notes, files, links. Catch-all for anything else.

**Tech requirements:**
- Standard web app (React/Next.js + database + auth)
- GitHub OAuth integration
- Stripe Connect integration
- Real-time updates (WebSocket or SSE for project activity)

### 3.2 MCP Server (The Bridge to Every Environment)

An MCP server that lets vibecoders — regardless of role — interact with the platform from their environment. Not just for code. A marketer using Claude to write copy, a designer using Cursor to build a landing page, a PM using ChatGPT to plan strategy — they all push their work through the same MCP.

**Package:** `@clanka/mcp-server` — TypeScript, `@modelcontextprotocol/sdk` + `zod`, stdio transport, JSON-RPC 2.0.

**How it works:**
1. Vibecoder installs the MCP server (one-time setup via npm)
2. They generate an API key in Settings on clanka.chat
3. They add the MCP server to their AI tool with their API key as env var
4. They work in their environment using whatever AI tool they prefer
5. They push deliverables, status updates, metrics, or code to the platform
6. Platform records the contribution, shows it on the project timeline, counts it toward reputation

**Authentication:**
- User generates an API key (`ck_xxx`) in Settings → stored in `profiles.api_key`
- API key is provided as `CLANKA_API_KEY` env var when adding the MCP server
- Each MCP tool call includes the key in the request header (`Authorization: Bearer ck_xxx`)
- Server validates key → resolves to user → checks project permissions

**Setup examples:**
```bash
# Claude Code
claude mcp add clanka -e CLANKA_API_KEY=ck_xxx -- npx @clanka/mcp-server

# Cursor / Windsurf (.cursor/mcp.json or similar)
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

**v1 tools (6 — hackathon scope):**

| Tool | AI Description (tells model *when* to use it) | API Call |
|------|-------------|----------|
| `list_projects` | "List all projects you're a member of. Use when checking statuses or deciding which workspace to work on." | `GET /api/projects?mine=true` |
| `view_workspace` | "Get full workspace details — timeline, team, terms, deploy status, GitHub repo. Use when checking on a specific project." | `GET /api/workspace/{slug}` |
| `push_update` | "Post a progress update (progress/milestone/blocker/decision) to workspace timeline. Use when work is done or communicating with collaborator." | `POST /api/workspace/{slug}/updates` |
| `edit_clanka_md` | "Read or update YOUR CLANKA.md for a workspace. Each collaborator has their own. Use 'read' before starting work, 'write' after making changes, 'init' on first use to create local file." | `GET/PUT /api/workspace/{slug}/clanka-md` |
| `create_listing` | "Create a new project listing and initialize your CLANKA.md file locally + on platform. Use when posting a new idea to find collaborators." | `POST /api/projects` |
| `deploy` | "Trigger Vercel deployment for workspace. Uses latest code on main branch. Returns immediately — build takes 30-120s." | `POST /api/workspace/{slug}/deploy` |

**Tool design principles (MCP spec 2025-11-25):**
- Descriptions tell the AI *when* to use the tool, not just what it does
- Underscore naming (`list_projects` not `list-projects`) — reads better in MCP client display (`mcp__clanka__list_projects`)
- Every input property has a `description` in JSON Schema
- Read-only tools annotated with `readOnlyHint: true` (safe to call without user confirmation)
- Errors returned as `isError: true` with human-readable messages — never raw API errors
- Returns only what the AI needs for decision-making, not full database rows

**Error handling:**
- 401 → "API key is invalid or expired. Generate a new one at clanka.chat/settings."
- 403 → "You're not a member of this workspace."
- 404 → "Workspace not found. Use list_projects to see your workspaces."
- 429 → "Rate limit reached. Try again in a few seconds."
- 500 → "Something went wrong on our end. Try again."

**Future tools (post-v1):**

*Universal contribution push (works for ANY role):*
- `push_deliverable` — Push any work output to the project timeline
  - Code: auto-detected, pushed to GitHub, triggers deploy
  - Content: marketing copy, blog posts, email sequences → stored as project assets
  - Assets: designs, images, documents → uploaded to project storage
  - Metrics: "500 signups this week, $200 ad spend, 2.5% conversion" → project dashboard
  - Status: "launched Google Ads campaign targeting X keywords" → project timeline
- `push_to_canvas` — Deploy live code to the user's canvas (see Section 13)

*Discovery:*
- `share_project_context` — Share CLAUDE.md/project files for AI-powered matching
- `find_matches` — Get top matches for your project
- `browse_projects` — Browse projects that need your skills

**Architecture:**
```
AI Tool (Claude Code / Cursor / Windsurf)
  ↕ stdio (JSON-RPC 2.0)
MCP Server (@clanka/mcp-server)
  ↕ HTTPS (Authorization: Bearer ck_xxx)
clanka.chat API (/api/*)
  ↕
Supabase (data) + GitHub API (repos) + Vercel API (deploys)
```

**The push_deliverable concept (post-v1):**
```
push_deliverable({
  type: "content",           // or "code", "asset", "metric", "status"
  title: "Email sequence for launch",
  description: "5-email drip campaign for new signups, A/B variants for subject lines",
  attachments: ["emails.md"],
  tags: ["marketing", "email", "launch"]
})
```
This is like a git commit but for any type of work. Timestamped, visible to the team, builds contribution history. The platform doesn't care what role you are — it tracks that you did work and shows it.

**Works with:**
- Claude Code (via `claude mcp add`)
- Cursor/Windsurf (via MCP config JSON)
- OpenClaw (via `openclaw.json` — confirmed compatible)
- Any MCP-compatible client

**Precedent:** Vercel, Netlify, GitHub, Linear, Notion, Figma, Supabase, Stripe, Sentry all have official MCP servers. This is a standard pattern.

### 3.3 Platform-Controlled GitHub Repository

Code lives on the platform's GitHub org. Private by default. Nobody has direct access unless the project creator grants it.

**Implementation:** GitHub App installed on a GitHub Organization (`clanka-projects`). The app manages all repos programmatically via `octokit`, `@octokit/app`, and `@octokit/webhooks`.

**Branching strategy (v1): main-only.** All collaborators push directly to `main`. These are 2-person micro-projects where vibecoders using AI tools push directly. Vercel auto-deploys on push to `main`. Branch protection and PR workflows are post-v1.

**GitHub App permissions:**

| Permission | Access | Why |
|-----------|--------|-----|
| Repository > Administration | Read & Write | Create repos, manage collaborators |
| Repository > Contents | Read & Write | Read code, commits |
| Repository > Pull requests | Read | Track PRs in workspace |
| Repository > Webhooks | Read & Write | Receive push/PR events |

**Webhook events subscribed:**

| Event | Use |
|-------|-----|
| `push` | Track commits → show in workspace timeline |
| `pull_request` | Track PRs → show in workspace Code tab |
| `deployment_status` | Update deploy status in workspace |

**Webhook handler:** `POST /api/github/webhooks` — verifies signature with webhook secret, routes events to handlers that insert into workspace updates or update deploy status.

**How it works:**
1. When a workspace is created (terms accepted, both users Stripe-connected, code-access collaborators have `github_username` set in Settings), the platform creates a private repo under `clanka-projects` org via GitHub API
2. Platform adds code-access collaborators to the repo using their `github_username`
3. Initializes with README containing project info
4. Stores repo details in `projects` table (`github_repo_name`, `github_repo_full_name`, `github_repo_url`)
5. Creates a linked Vercel project (see Section 3.4)
6. The project creator decides who gets code access per collaborator (e.g., second coder = access, marketer = no access)
7. Collaborators with code access can view/pull the repo but all pushes go through MCP → platform validates → pushes to GitHub
8. The platform dashboard shows commit history, deploy status, and diffs between versions
9. Nobody has admin access to the repo — platform controls it

**Why platform-controlled:**
- **Payment protection** — nobody can redeploy with different Stripe keys because nobody controls the hosting directly
- **Domain protection** — `projectname.clanka.chat` is our domain, tied to our deployment
- **Code protection** — collaborators without code access can't clone and run. Those with access can see/pull but the deployment and revenue pipe are still platform-controlled
- **Creator leaves?** — platform can grant code access to remaining collaborators via ownership transfer request

**What about collaborator code access?**
- Project creator sets access per person when accepting a collaboration request
- Code access = can view repo, pull code, push updates via MCP
- No code access = can only see commit summaries and deploy status on the dashboard
- Access can be changed later by mutual agreement

**The remaining loophole:**
Someone with code access could clone the repo and redeploy it elsewhere. But they'd lose: the deployment, the subdomain, the Stripe pipe, the customers, the contribution history, and their reputation on the platform. In the vibe coding era, the code is the least valuable part — AI can rewrite it. The product, users, and revenue stream are what matter.

### 3.4 Platform-Controlled Deployment (Vercel)

The platform IS the deployment layer. **Vercel** is the deploy target (decision locked — Cloudflare Pages removed from scope).

**Implementation:** Each workspace project gets a Vercel project linked to its GitHub repo. Pushes to `main` auto-deploy. Users can also trigger manual deploys from workspace UI or via MCP `deploy` tool.

**Vercel API calls:**

| Action | Method | Endpoint |
|--------|--------|----------|
| Create project (linked to GitHub repo) | `POST` | `/v10/projects` |
| Create Deploy Hook | `POST` | `/v10/projects/{projectId}/deploy-hooks` |
| Trigger deploy via hook | `POST` | Deploy Hook URL (no auth needed) |
| Get deploy status | `GET` | `/v13/deployments/{id}` |
| List deploys | `GET` | `/v6/deployments?projectId={id}` |

**Deploy states (shown in workspace):**

| Vercel State | UI Display |
|-------------|-----------|
| `QUEUED` | "Queued..." |
| `BUILDING` | "Deploying..." |
| `READY` | "Live" + URL link |
| `ERROR` | "Failed" + error message |
| `CANCELED` | "Canceled" |

**Auth:** Single Vercel API Token generated from Vercel dashboard, stored as server-side env var. Never exposed to client.

**Vercel tier strategy:**
- **Hackathon / pre-revenue: Hobby (free)** — 200 projects, 100 deploys/day, 1 concurrent build. More than enough for launch.
- **When commercial: upgrade to Pro ($20/mo)** — Hobby is non-commercial only. Pro gives unlimited projects, 6,000 deploys/day, 12 concurrent builds, pay-as-you-go overages.

**How it works:**
1. Workspace created → GitHub repo created → Platform calls Vercel API to create project linked to repo
2. Vercel installs its GitHub App on the repo (auto via API)
3. Platform creates a Deploy Hook URL and stores it in `projects.vercel_deploy_hook_url`
4. Every push to `main` → Vercel auto-deploys
5. Manual deploy: user clicks "Deploy" in workspace or uses MCP `deploy` tool → platform POSTs to Deploy Hook URL
6. Platform polls Vercel API for deploy status → updates `deploys` table
7. Workspace shows: "Deploying..." → "Live at https://xxx.vercel.app"
8. After first deploy: project goes live, Stripe Connect env vars injected

**Database:** Deploy history stored in `deploys` table with fields: `vercel_deployment_id`, `vercel_url`, `status`, `triggered_by`, `source` (manual/push/mcp), `error_message`. Projects table has `vercel_project_id`, `vercel_deploy_hook_url`, `live_url`.

**What the platform controls:**
- GitHub repo (under platform's org, private)
- Hosting account (platform's Vercel account)
- Environment variables (Stripe keys injected at deploy, never exposed to collaborators)
- Subdomain (`projectname.clanka.chat` — our DNS)
- Deploy pipeline (who can trigger deploys, auto-deploy toggle)

**What the platform surfaces to collaborators:**
- Deploy status (queued / building / live / failed)
- Build logs (pulled from Vercel API)
- Version history (what's currently deployed, previous versions)
- Diff view (what changed between versions)
- Rollback button (redeploy a previous version)

**Cost:** Vercel Hobby (free) for hackathon. Vercel Pro ($20/mo) when commercial. Platform bears the hosting cost, offset by 5% revenue fee.

### 3.5 Stripe Connect Revenue Splitting

How collaborators share money from their micro-startup.

**Stripe lives on the user's profile, not per-project:**
1. User signs up → profile dashboard has "Connect Stripe" button
2. Users can browse, create listings, send/receive connection requests WITHOUT Stripe connected
3. Stripe is NOT required to post a listing
4. Stripe IS required before the shared workspace can be created — both parties must have it connected
5. One-time setup on profile, applies to all projects

**When Stripe is needed:**
```
Post listing → No Stripe needed
Browse/request → No Stripe needed
Discuss terms → No Stripe needed
Both accept → "Connect Stripe to continue" prompt for whoever hasn't
Both connected → Workspace created, revenue split configured per agreed terms
```

**How revenue flows:**
1. Customer pays → money hits platform's Stripe account
2. Platform holds funds for 48 hours (aligns with Stripe's minimum payout schedule)
3. Platform splits and transfers to each collaborator's connected Stripe account
4. Platform keeps 5% fee (`application_fee_amount`)
5. Split is set per-project based on agreed terms, changeable by mutual agreement only

**Technical model:**
- **Separate Charges and Transfers** — the only Stripe Connect model that supports splitting one payment to multiple recipients
- Platform charges the full amount, then transfers portions to each connected account
- Split is set per-transaction, not hardcoded

**Fees:**
- Stripe processing: ~2.9% + $0.30 per transaction
- Connect split fee: 0.25% per transfer
- Platform fee: 5% (our revenue)
- Total cost to the customer: standard card rate. Splits happen on the backend.

**Example on $100 sale, 50/50 split:**
- Stripe takes ~$3.45
- Platform takes $5.00 (5%)
- Person A receives $45.78
- Person B receives $45.77

**Changing Stripe accounts:** Users can disconnect/reconnect on their profile. Active projects with revenue flowing require mutual agreement to change Stripe setup (same as changing revenue split).

### 3.6 CLANKA.md — Per-Collaborator Context File

A **per-collaborator** context file maintained by each user's AI. One CLANKA.md per collaborator per project. Lives in two places: locally in the user's project directory AND on the platform (Supabase). The bridge between what's happening in each person's environment and what's shown on the platform.

**Core model:** A 2-person workspace has 2 CLANKA.md files. A coder's CLANKA.md talks about code architecture and tech debt. A marketer's talks about campaigns and conversion rates. Same project, different perspectives.

**Where it lives:**
1. **Locally** — `./CLANKA.md` in the collaborator's project directory. Written by the MCP server. The user's AI reads this for context.
2. **On the platform** — `clanka_files` table in Supabase (one row per user per project). Synced via MCP.

**Lifecycle:**
1. **Created during `create_listing`** — When a user creates a listing via MCP, the MCP server:
   - Creates `./CLANKA.md` in the user's local project directory
   - Populates it from listing data + inferred local context (CLAUDE.md, package.json, README if present)
   - Pushes the content to the platform via API
2. **Collaborator's CLANKA.md created when they join** — When terms are accepted and workspace is created, the platform creates their CLANKA.md. The collaborator's MCP server writes it locally on first `edit_clanka_md(init)` call.
3. **Updated on every contribution** — Every time a collaborator does work (code push, marketing update, milestone, decision):
   - `push_update` → platform auto-appends to that user's CLANKA.md "Recent Changes" section
   - `edit_clanka_md(write)` → full rewrite by the AI (e.g. after a big refactor, AI re-summarizes project state)
   - Local file and platform copy stay in sync via MCP
4. **Two-way sync** — `edit_clanka_md(read)` pulls latest from platform (in case of web UI edits or auto-appends). `edit_clanka_md(write)` pushes local content to platform.

**What CLANKA.md contains (coder example):**
```markdown
# Project: CoolApp
## Role: Creator (code)
## Stack: Next.js, Supabase, Stripe, Tailwind
## Stage: MVP launched, iterating on payments

## Current Status
- Auth system complete
- Stripe integration live
- Payment webhooks handling all events

## Recent Changes
- Added Stripe webhook handler (Mar 4)
- Fixed auth redirect bug (Mar 5)

## Decisions
- Using Supabase Auth over Clerk (simpler, cheaper)
- Monthly billing only for v1 (no annual plans yet)

## My Contributions
- Built auth system (10 commits)
- Stripe Connect integration (8 commits)
- API routes for all endpoints (15 commits)
```

**Visibility in workspace:**
- Each collaborator sees **their own** CLANKA.md by default
- **Cross-visibility depends on agreed terms** — if terms grant full transparency, both can see each other's. Otherwise, each sees only their own.
- Workspace CLANKA.md tab: "Your CLANKA.md" (always visible) + "Collaborator's CLANKA.md" (if terms allow)

**Why per-collaborator (not shared):**
- Each AI has different context — a coder's AI sees code, a marketer's AI sees campaigns
- The user's AI has the richest context — it sees actual files and project state
- Per-user files prevent conflicts (no merge issues between two people editing one file)
- The platform can still aggregate both into a unified project view

**Database:**
```sql
create table clanka_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, user_id)
);
```

**Compatibility:** CLANKA.md is tool-agnostic. Any AI (Claude Code, Cursor, Windsurf, ChatGPT, OpenClaw) can read and maintain it. Coexists with tool-specific files (CLAUDE.md, .cursorrules, AGENTS.md) — the AI reads those to inform what goes into CLANKA.md.

### 3.7 Contribution Tracking & Reputation

How the platform provides "protection disguised as service." Works for every role, not just code.

**What gets tracked automatically:**
- Git commits (via GitHub webhooks) — for code roles
- Deployment events (via Vercel/Netlify webhooks) — for code roles
- Revenue generated (via Stripe Connect) — for everyone
- Deliverables pushed (via `push_deliverable` MCP tool) — for every role

**What a project timeline looks like:**

```
Mar 4  @alice  [code]      Pushed auth system (14 commits)
Mar 4  @alice  [deploy]    Deployed to production (v0.3.1)
Mar 5  @bob    [content]   Email sequence for launch (5 emails, A/B variants)
Mar 6  @bob    [metric]    Google Ads live: $50/day, targeting "invoice software"
Mar 7  @alice  [code]      Stripe integration (8 commits)
Mar 8  @bob    [status]    Landing page copy finalized, 3 hero variants
Mar 9  @bob    [metric]    Week 1: 847 impressions, 34 clicks, 12 signups
Mar 10 @alice  [deploy]    Deployed payments (v0.4.0)
Mar 10         [revenue]   First sale: $29 — split $13.78 / $13.78 (5% platform)
```

Every contribution is timestamped and attributed, regardless of type.

**What's visible:**
- On the project page: unified timeline of all contributions from all roles
- On user profiles: projects shipped, revenue tier badge ($100+, $1K+, $10K+), role tags per project
- Private repos stay private — but contribution stats (not code) are visible on profiles

**Why this is protection:**
- If someone disappears mid-project, their lack of contribution is visible
- If someone tries to claim credit, the timeline tells the truth
- If there's a dispute, the platform has a complete record
- Reputation compounds — good collaborators get more collaboration requests
- Non-code work is first-class — a marketer who drives signups has visible, valued contributions just like a developer who ships features

---

## 4. HOW THINGS CONNECT

```
┌──────────────────────────────────────────────────────────────┐
│              VIBECODER A (Developer)                          │
│  Environment: Cursor / Claude Code / Windsurf / etc.         │
│                                                              │
│  ┌─────────────────────────────────────────────┐             │
│  │           @clanka/mcp                       │             │
│  │                                             │             │
│  │  push_deliverable({ type: "code", ... })    │─── code ──▶ GitHub
│  │  push_to_canvas({ code: "...", slot: "x" }) │─── widget ▶ Cloudflare Workers
│  │  share_project_context()                    │─── match ─▶ Platform API
│  │  check_activity()                           │             │
│  └─────────────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              VIBECODER B (Marketer)                           │
│  Environment: Claude / ChatGPT / Cursor / any AI tool        │
│                                                              │
│  ┌─────────────────────────────────────────────┐             │
│  │           @clanka/mcp                       │             │
│  │                                             │             │
│  │  push_deliverable({                         │             │
│  │    type: "content",                         │─── work ──▶ Platform API
│  │    title: "Launch email sequence",          │             │
│  │    attachments: ["emails.md"]               │             │
│  │  })                                         │             │
│  │  push_deliverable({                         │             │
│  │    type: "metric",                          │─── data ──▶ Project Dashboard
│  │    data: { signups: 500, spend: 200 }       │             │
│  │  })                                         │             │
│  └─────────────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────────┘

                        │                 │
                        ▼                 ▼
┌──────────────────────────────────────────────────────────────┐
│                    CLANKA.CHAT PLATFORM                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  Platform API │  │  Web Dashboard│  │ Matching Engine   │   │
│  │  (Next.js)   │  │  (Next.js)   │  │ (Haiku + pgvector)│   │
│  └──────┬───────┘  └──────────────┘  └───────────────────┘   │
│         │                                                    │
│  ┌──────▼───────────────────────────────────────────────┐    │
│  │  Supabase (Postgres)                                 │    │
│  │  • users, projects, contributions, canvas_slots      │    │
│  │  • profiles (AI-extracted), matches                   │    │
│  │  • deliverables (all types), revenue tracking        │    │
│  │  • Realtime (live project activity)                  │    │
│  │  • pgvector (semantic matching)                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────── External APIs ─────────────────┐   │
│  │  GitHub API ─── platform-controlled repos, commit data │   │
│  │  Vercel API ── platform-controlled deploy              │   │
│  │  Stripe Connect ── revenue split, 5% platform fee     │   │
│  │  Cloudflare Workers for Platforms ── canvas widgets    │   │
│  │  Cloudflare for SaaS ── subdomain SSL/routing         │   │
│  │  OpenAI/Anthropic ── profile extraction, matching     │   │
│  │  Meilisearch ── project search/discovery              │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────── Public Pages ──────────────────┐   │
│  │  clanka.chat/              ── project feed             │   │
│  │  clanka.chat/u/username    ── user profile/portfolio    │   │
│  │  clanka.chat/project/:slug ── project dashboard        │   │
│  │  projectname.clanka.chat   ── project public page      │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Data flows:**

*Developer vibecoder:*
1. Writes code in IDE → pushes via MCP → platform stores on its GitHub org (private repo)
2. Code appears as "ready to deploy" in workspace → coder clicks Deploy (or enables auto-deploy)
3. Platform deploys to its own Vercel account, injecting Stripe env vars
4. Pushes canvas widgets via MCP → Cloudflare Workers (live in ~2-5s)

*Marketer/Designer/PM vibecoder:*
1. Creates deliverables using AI tools (copy, designs, campaigns, plans)
2. Pushes deliverables via MCP → platform records on project timeline
3. Pushes metrics via MCP → visible on project dashboard
4. If deliverable is code (landing page, email template) → same flow as developer

*Both:*
- Revenue from customers → Stripe Connect → 48-hour hold → auto-split to all collaborators → 5% platform fee
- All contributions visible on unified project timeline
- Reputation builds from both code and non-code contributions

---

## 5. WHAT WE NEED TO BUILD

### Must Build (Custom)

| Component | Description | Complexity |
|-----------|-------------|------------|
| **Web Dashboard** | Project feed, project pages, user profiles, workspace | High — this is the core product |
| **Platform API** | REST/GraphQL API for MCP, webhooks, integrations | Medium |
| **MCP Server** | NPM package that vibecoders install | Medium |
| **Auth System** | GitHub OAuth + email. Stripe Connect OAuth. | Medium |
| **Project Workspace** | Structured sections for code + non-code work | Medium |
| **Contribution Tracker** | Aggregate commits, deploys, revenue, updates | Medium |
| **Private Messaging** | Ongoing 1:1 private chat (`/messages`), starts from connection requests, continues as needed | Low-Medium |

### Off-the-Shelf (Integrate)

| Service | What It Does | Integration |
|---------|-------------|-------------|
| **GitHub API** | Repo creation, collaborator management, webhooks | OAuth + REST API |
| **Vercel API** | Deployment connection, preview deploys | OAuth + REST API |
| **Stripe Connect** | Revenue splitting, payouts | Express accounts + API |
| **Auth provider** | GitHub OAuth, session management | Clerk / NextAuth / Supabase Auth |
| **Database** | Users, projects, contributions, updates | Supabase (Postgres) or PlanetScale |
| **Real-time** | Project activity updates | Supabase Realtime or Pusher |

### Don't Build

| Thing | Why Not |
|-------|---------|
| Real-time code editing | Unsolved cross-editor problem. Git works fine. |
| Full real-time chat system | Polling-based 1:1 messaging is enough for v1. No group chat — workspace timeline handles multi-person once workspace exists. |
| Full PM tool (Jira clone) | Overkill. Simple workspace sections are enough. |
| Payment processing | Stripe Connect handles this entirely |
| Deployment hosting (user-managed) | Platform controls deployment via its own Vercel account. Users don't manage hosting. |
| Contract/legal system | Protection comes from infrastructure, not contracts |

---

## 6. INTEGRATION REQUIREMENTS

### GitHub Integration (Platform-Side, Not User-Facing)
- **GitHub App** installed on `clanka-projects` org — manages all repos programmatically
- **Packages**: `octokit`, `@octokit/app`, `@octokit/webhooks`
- **Permissions**: Repository Administration R/W, Contents R/W, Pull requests Read, Webhooks R/W
- **Webhook events**: `push` (track commits), `pull_request` (track PRs), `deployment_status` (deploy updates)
- **API calls**: Create repo in org, add collaborators, read commit history/diffs
- **User-facing**: Users push code via MCP → platform pushes to its GitHub. Users with code access can view/pull but not push directly.
- Full technical details in Section 3.3.

### Deployment Integration (Vercel — Platform-Side, Not User-Facing)
- The platform uses its own **Vercel** account — users do NOT connect their own hosting
- **Platform's hosting setup**: Vercel Pro ($20/mo), linked to platform's GitHub org
- **Vercel API**: Create project linked to GitHub repo, create Deploy Hooks, poll deploy status
- **Deploy triggers**: Auto-deploy on push to `main`, manual deploy via workspace UI button or MCP `deploy` tool
- **Deploy states**: QUEUED → BUILDING → READY/ERROR — shown in workspace
- **API calls**: Create project, trigger deploy via Deploy Hook, set environment variables (Stripe keys injected here), manage domains
- **User-facing**: "Deploy" button in workspace, deploy status, build logs, rollback button. Optional auto-deploy toggle.
- Full technical details in Section 3.4.

### Stripe Connect Integration
- **Account type**: Express (simplest — Stripe handles onboarding)
- **Charge model**: Separate Charges and Transfers (supports multi-recipient split)
- **Webhooks**: `payment_intent.succeeded`, `transfer.created`, `account.updated`
- **API calls**: Create connected account, create account link, create payment intent, create transfer
- **User action**: Click "Connect Stripe" → redirected to Stripe-hosted onboarding (~5 min) → done

### MCP Server
- **Transport**: stdio (standard MCP transport)
- **Auth**: API key generated on platform, stored locally
- **Protocol**: Standard MCP tool calls
- **Distribution**: npm package (`npx @platform/mcp-server`)
- **Config**: Added to `.mcp.json` (Claude Code), `openclaw.json` (OpenClaw), etc.

---

## 7. BUILD PHASES

**Principle: Monetizable from Phase 1.** Every phase delivers value that either generates revenue or directly enables it. No building 3 phases of infrastructure before seeing a dollar.

### Phase 1: Core Infrastructure + Revenue Pipe (Weeks 1-6)

The minimum viable product: two vibecoders can find each other, create a shared project, deploy it, and split revenue.

- [ ] Next.js project + Supabase (auth, DB, realtime)
- [ ] GitHub OAuth — connect account, create shared repo via API, add collaborators
- [ ] Vercel OAuth — link repo to Vercel, auto-deploy on push to main
- [ ] Stripe Connect — Express account onboarding, revenue split config, 5% platform fee
- [ ] User profiles (basic — name, GitHub, skills, bio)
- [ ] Project CRUD — create project, link GitHub repo, set up deploy + payments
- [ ] Project dashboard — shows commits (GitHub webhook), deploy status (Vercel webhook), revenue (Stripe webhook)
- [ ] Simple project feed — browse/filter projects looking for collaborators
- [ ] Deploy to Vercel

**What this enables:** Two people meet, create a project on clanka.chat, get a shared repo + auto-deploy + payment splitting in minutes. Platform earns 5% from first sale. This is the core loop.

### Phase 2: MCP Server + Contribution Tracking (Weeks 7-10)

The bridge between vibecoders' environments and the platform.

- [ ] Build MCP server (TypeScript, stdio transport)
- [ ] `create_listing` — analyze local project files, create listing on platform
- [ ] `push_deliverable` — universal push for any role (code, content, assets, metrics, status)
- [ ] `check_activity` — see what co-builders have been doing
- [ ] `sync_status` — pull latest project state
- [ ] `share_project_context` — share CLAUDE.md/project files for matching
- [ ] `find_matches` / `browse_projects` — discovery from the IDE
- [ ] Publish to npm (`@clanka/mcp`)
- [ ] Docs for connecting to Claude Code, Cursor, Windsurf, OpenClaw
- [ ] Unified contribution timeline on project dashboard (code + non-code)
- [ ] AI-powered profile extraction from project files (Haiku, ~$0.005/request)
- [ ] Basic bidirectional matching (demonstrated_skills vs. likely_needs)

**What this enables:** Vibecoders interact with the platform without leaving their IDE. Non-code roles can push deliverables. Matching helps people find the right collaborators. Contribution tracking provides accountability.

### Phase 3: Canvas Engine + Customizable Workspace (Weeks 11-14)

The visual layer — personal portfolios, project dashboards, live widgets.

- [ ] Cloudflare Workers for Platforms setup ($25/month)
- [ ] Dispatch namespace + routing worker
- [ ] `push_to_canvas` MCP tool — deploy code to canvas slot
- [ ] `update_canvas` / `remove_from_canvas` / `list_canvas` / `arrange_canvas` tools
- [ ] Canvas layout system (grid/freeform, stored as JSON)
- [ ] Iframe sandboxing for widget display
- [ ] Cloudflare for SaaS — subdomain routing (`projectname.clanka.chat`)
- [ ] Public profile pages (`clanka.chat/u/[username]`)
- [ ] Public project pages (`clanka.chat/project/:slug`)

**What this enables:** Users have a live, customizable presence on the platform. They can showcase projects, display dashboards, and push interactive widgets — all from their IDE.

### Phase 4: Polish + Discovery + Reputation (Weeks 15-18)

Make the platform feel complete and trustworthy.

- [ ] Reputation system — contribution history on profiles, project completion stats
- [ ] Reputation: tier badges ($100+, $1K+, $10K+), project count, role tags per project. No cross-role scoring.
- [ ] Enhanced discovery — semantic matching with embeddings (pgvector)
- [ ] Project search with Meilisearch
- [ ] CLANKA.md support (user-AI-maintained sync file, platform reads and reflects)
- [ ] Onboarding flow for new vibecoders
- [ ] Landing page, docs, examples
- [ ] File/asset upload for non-code deliverables
- [ ] Revenue dashboard improvements

---

## 8. WHAT THIS IS NOT

- **Not a freelance marketplace** — No one is hiring. People are co-building.
- **Not a code editor** — Everyone uses their own tools.
- **Not a project management tool** — Lightweight workspace, not Jira.
- **Not a chat platform** — Ongoing 1:1 private messaging for collaboration discussion. Polling-based in v1. Workspace timeline handles multi-person updates.
- **Not a hosting provider (to the user)** — Platform handles deployment under the hood via Vercel, but users don't manage hosting directly.
- **Not a payment processor** — Stripe does the payments.
- **Not a code review tool** — GitHub handles PRs.

The platform is the **connective tissue** between all these existing tools, focused on one thing: making it easy for vibecoders to find each other, build together, and share revenue.

---

## 9. REVENUE MODEL

| Revenue Source | How | When |
|---------------|-----|------|
| **5% platform fee** | Automatic cut on all revenue flowing through Stripe Connect | From first sale of any project |
| **Premium features** (future) | Enhanced project visibility, analytics, priority matching | After community reaches critical mass |

**Why 5%:**
- Lower than Gumroad (10%), Substack (10%), Patreon (5-12%)
- Competitive for a platform that provides infrastructure
- Aligns incentives — platform makes money only when builders make money
- At scale: 100 projects × $1,000/month avg revenue = $5,000/month platform revenue

**Buildspace lesson:** Have revenue from day 1. Don't build a free community and hope to monetize later.

---

## 10. COMPETITIVE LANDSCAPE & DIFFERENTIATION

### Existing co-founder matching platforms (20+)
YoFounder, IndieMerger, CoffeeSpace, StartHawk, SideProjectors, ProblemHunt, etc.

**ALL stop at matching.** None handle:
- Shared repo creation
- Auto-deployment
- Revenue splitting
- Contribution tracking
- IDE/terminal integration

### Buildspace (closest analog — shut down Aug 2024)
70K+ participants, a16z backed at $100M. Failed because: solo founder burnout, no business model, platform fragmented across 7 tools.

**We avoid their mistakes by:**
1. Revenue from day 1 (5% cut)
2. One platform (not duct tape)
3. Infrastructure-as-product (not just community vibes)
4. Not taking VC money early

### Our unique angle
Nobody is building the **co-building infrastructure layer** for vibecoders. Matching exists. Building tools exist. Revenue tools exist. But nobody connects: **find a partner → create shared project → build together → deploy → split revenue** in one flow.

---

## 11. DECISIONS MADE

1. **Name**: clanka.chat
2. **Platform-controlled GitHub**: Code lives on platform's GitHub org. Private by default. Creator grants per-collaborator access. (Section 3.3)
3. **Platform-controlled deployment**: Upload ≠ deploy. Deploy button in workspace. Auto-deploy is optional toggle. (Section 3.4)
4. **Stripe on profile**: Users connect Stripe once on their profile. Required before workspace creation, not before listing. (Section 3.5)
5. **CLANKA.md**: Per-collaborator context file (one per person per project). Created during `create_listing` locally + on platform. Updated on every contribution. Lives in user's project dir AND Supabase. Cross-visibility depends on terms. (Section 3.6)
6. **Private messaging**: Ongoing 1:1 private chat (`/messages` page). Starts from connection requests, continues as long as needed. Polling-based in v1.
7. **Workspace**: 4 grouped tabs — **Timeline** (default, chronological activity) | **Work** (Code, Marketing, Management, General sub-sections) | **Money** (Revenue dashboard, payout history, agreed terms) | **CLANKA.md** (per-collaborator: "Your CLANKA.md" always visible + "Collaborator's CLANKA.md" if terms allow; editable via MCP or web UI)
8. **Browser vibecoders**: Web dashboard IS their interface. No MCP needed.
9. **Team size**: Up to 10 people per project
10. **Competition/contest mode**: Later feature, not v1
11. **Subdomain hosting**: Yes — `projectname.clanka.chat` (Section 14)
12. **Discovery algorithm**: Bidirectional skill matching — "I do X / I need Y" (Section 15)
13. **Terms structure**: Revenue split required, rest optional but prompted (Section 20)
14. **Custom domains**: Subdomain only in v1. Custom domains are v2+ due to payment protection complexity.
15. **Tech stack**: Next.js 15 (App Router) + Supabase (PostgreSQL + Auth + Storage) + Tailwind CSS 4 + Vercel.
16. **MCP server**: `@clanka/mcp-server`, TypeScript + `@modelcontextprotocol/sdk` + `zod`, stdio transport, API key auth.
17. **GitHub integration**: GitHub App on `clanka-projects` org (not PAT). Manages repos programmatically via `octokit`.
18. **Deploy target**: Vercel only (Cloudflare Pages removed from scope). Deploy Hooks for manual triggers, auto-deploy on push to `main`.
19. **Vercel pricing**: Hobby (free) for hackathon — 200 projects, 100 deploys/day, plenty for launch. Upgrade to Pro ($20/mo) when commercial activity starts.
20. **Git branching**: Main-only for v1. All collaborators push to `main`, Vercel auto-deploys. Branch protection/PRs are post-v1.
21. **MCP tool naming**: Underscore convention (`list_projects`, not `list-projects`). Descriptions tell AI *when* to use tools, not just what they do. Errors as `isError: true` with human messages.
22. **GitHub username in Settings**: Collected in Settings page (not onboarding). Required for code-access collaborators before workspace creation. Workspace creation checks: Stripe connected + GitHub username set (for code-access roles). Non-code collaborators (e.g., marketers) don't need it.
23. **Project slug format**: `slugify(name)-nanoid(6)` (e.g., `vibetunes-a3f8k2`). Generated once at creation, never changes. Used in URLs and API calls.

## 12. REMAINING OPEN QUESTIONS

1. ~~**Tech stack decision**~~ — RESOLVED: Next.js 15 (App Router) + Supabase (PostgreSQL + Auth + Storage) + Tailwind CSS 4. See hackathon-plan.md for full stack.
2. ~~**MCP server name**~~ — RESOLVED: `@clanka/mcp-server`. Package on npm, installed via `npx @clanka/mcp-server`.
3. **Onboarding flow specifics** — How many steps? What's mandatory?
4. **Moderation** — How to handle spam, bad actors, abandoned projects?
5. **International** — Multi-language support? Or English-only at start?

---

## 13. ROADMAP: CUSTOMIZABLE WORKSPACE — FREEFORM CANVAS VIA CODE PUSH (Phase 3)

Users have a personal canvas on clanka.chat — portfolio, project showcase, live dashboards — fully customizable by pushing code from their IDE via MCP.

### Core Concept: Push Code, Get Live Widgets

Vibecoders write code in their IDE, push it via MCP, and it appears as a live functional widget on their canvas. No pre-built widget catalog. No drag-and-drop limitations. Full creative freedom from day 1.

### How It Works (End-to-End, ~2-5 seconds)

```
1. User in IDE → MCP tool call: push_to_canvas({ code: "...", slot: "dashboard" })
2. MCP server → clanka.chat API with bundled code
3. Platform → Cloudflare Workers API deploys as V8 isolate (1-3s, dominant latency)
4. 200 OK = code is live globally on Cloudflare's edge
5. Platform updates canvas DB with worker URL + slot position
6. Canvas re-renders: <iframe src="https://user-widget.clanka.chat/dashboard" sandbox="...">
7. V8 isolate cold start on first visit: ~5-50ms
```

### Security: V8 Isolates via Cloudflare Workers for Platforms

Each user's pushed code runs in its own V8 isolate — the same technology that sandboxes every Chrome tab. Multi-layer defense:
- **V8 isolate**: Memory-isolated execution environment per user
- **Linux namespaces**: OS-level process isolation
- **Hardware memory protection**: CPU-enforced boundaries
- **Anti-Spectre mitigations**: Side-channel attack prevention
- **Sandboxed iframe**: Canvas renders via `<iframe sandbox="allow-scripts">` — no access to parent page, cookies, or navigation

We don't manage any of this isolation. Cloudflare does. **$25/month base**, pay-per-request after.

### What Users Can Push

- Any HTML/CSS/JS (bundled)
- React components (pre-bundled)
- Full dashboards and data visualizations
- Interactive widgets, games, tools
- npm packages (bundled at deploy time)
- Limit: 10MB compressed per widget, 128MB memory at runtime

### MCP Tools for Canvas

```
push_to_canvas     — Deploy code to a canvas slot
update_canvas      — Replace code in an existing slot
remove_from_canvas — Remove a widget
list_canvas        — See current canvas layout
arrange_canvas     — Reposition/resize widgets
```

### Infrastructure: Cloudflare Workers for Platforms

- **Dispatch namespace**: All user widgets live under one namespace, routed by username/slot
- **Deployment API**: `PUT /workers/dispatch/namespaces/{ns}/scripts/{name}` — synchronous, 1-3s
- **Routing**: Dispatch worker parses URL → routes to correct user widget
- **Global edge**: Deployed to 300+ Cloudflare locations automatically
- **Cost**: $25/month base (Workers for Platforms) + $0.50 per million requests

### Canvas Layout

The canvas itself is a simple grid/freeform layout stored as JSON in the database:
```json
{
  "slots": [
    { "id": "dashboard", "url": "https://workers.clanka.chat/alice/dashboard", "x": 0, "y": 0, "w": 2, "h": 1 },
    { "id": "metrics", "url": "https://workers.clanka.chat/alice/metrics", "x": 2, "y": 0, "w": 1, "h": 1 }
  ]
}
```
Users arrange slots via MCP commands or drag-and-drop on the web dashboard. Each slot is an iframe pointing to their deployed worker.

### AI-Powered Modification (Future Enhancement)

- User types "make my dashboard dark mode" → LLM modifies the code and re-deploys (~$0.005-0.03/request)
- Or: "add a chart showing my GitHub commits this week" → LLM generates widget code, deploys it
- Uses the same push flow — AI is just another client of the MCP tools

### Reference Implementations

- **Val.town**: User writes code → gets live iframe URL in seconds (Deno-based V8 isolates)
- **Figma plugins**: QuickJS compiled to WASM for deep sandboxing + iframe UI
- **Cloudflare Workers for Platforms**: Used by Shopify Oxygen, Grafbase, and others for multi-tenant code execution

### Alternative: Deno Subhosting

If Cloudflare doesn't fit:
- Each deployment auto-gets a URL (no routing setup needed)
- Free tier available
- 512MB memory (vs 128MB on Cloudflare)
- Native npm support without bundling
- Trade-off: Less edge distribution than Cloudflare

### Public Pages

- Profile page: `clanka.chat/u/[username]`
- Project canvas: `projectname.clanka.chat`
- Individual widgets also accessible directly at their worker URL

---

## 14. SUBDOMAIN HOSTING (projectname.clanka.chat)

### How It Works
1. Wildcard DNS: `*.clanka.chat` → load balancer
2. Reverse proxy parses subdomain from Host header
3. Database lookup: subdomain → project
4. Serve project's public page or 404
5. SSL via wildcard cert or per-hostname at edge

### Recommended: Cloudflare for SaaS
- Free for first 100 hostnames, $0.10/hostname/month after
- Handles SSL, CDN, DDoS, routing
- Create hostnames via API
- At 1,000 projects: ~$90/month

### Alternative: Vercel for Platforms
- If we're on Next.js/Vercel already
- Wildcard subdomains with auto-SSL, domain API
- $20/month Pro plan — starter kit template available

### Alternative: Self-hosted Caddy
- $10-20/month VPS, Caddy auto-provisions wildcard SSL
- Behind Cloudflare DNS (free)
- Most control, lowest cost at scale

---

## 15. ROADMAP: DISCOVERY & MATCHING ALGORITHM (Post-v1 Feature)

**Note:** AI-powered matching is an upcoming feature, not part of v1 scope. v1 uses manual browsing and filtering on `/explore`. The design below is for future reference.

### Core Design: AI-Powered Matching from Project Files

Instead of users manually filling out skill tags, the platform reads their project context files (CLAUDE.md, AGENTS.md, .cursorrules, or the platform's own CLANKA.md) and uses AI to extract structured matching data.

### How It Works

1. **User creates a project** on clanka.chat (via MCP or web dashboard)
2. **MCP asks to share** their project's CLAUDE.md / AGENTS.md / equivalent file (with user consent)
3. **AI extraction** (~$0.005/request with Haiku): LLM reads the project file and extracts:
   - Tech stack and tools used
   - Project type and stage
   - Skills demonstrated by the project
   - Skills/roles the project likely needs (inferred from gaps)
4. **Structured profile** generated automatically — user can review and edit
5. **Matching runs** against other users' extracted profiles

### What Gets Extracted

```json
{
  "tech_stack": ["Next.js", "Supabase", "Stripe", "Tailwind"],
  "tools": ["Claude Code", "Cursor"],
  "project_stage": "building_mvp",
  "demonstrated_skills": ["full-stack", "backend", "database-design"],
  "likely_needs": ["marketing", "design", "growth"],
  "description": "SaaS tool for freelance invoice management",
  "work_style": "async",
  "complexity": "medium"
}
```

### Bidirectional Matching: "I Do X / I Need Y"

Still the core model (from YC Co-Founder Matching), but now **auto-populated from project files** instead of manual tag selection:

- Person A's `demonstrated_skills` matched against Person B's `likely_needs`
- Person B's `demonstrated_skills` matched against Person A's `likely_needs`
- Tool overlap as secondary signal (people using the same AI tools work better together)

### Matching Formula (MVP)

```
complementary_score = overlap(A.demonstrated_skills, B.likely_needs)
                    + overlap(B.demonstrated_skills, A.likely_needs)
stack_relevance = jaccard_similarity(A.tech_stack, B.tech_stack) * 0.3
tool_overlap = jaccard_similarity(A.tools, B.tools) * 0.5
timezone_compat = 1.0 if |A.tz - B.tz| <= 3 else 0.5
availability_compat = 1.0 if similar_range else 0.7

final_score = complementary_score * 0.5
            + stack_relevance * 0.15
            + tool_overlap * 0.1
            + timezone_compat * 0.15
            + availability_compat * 0.1
```

### MCP Tools for Matching

```
share_project_context  — Share CLAUDE.md/project files for AI extraction
update_profile         — Review/edit extracted profile data
find_matches           — Get top matches for your project
browse_projects        — Browse projects that need your skills
```

### Technology by Phase

| Phase | Users | Approach | Tech |
|-------|-------|----------|------|
| 1 | <200 | AI extraction + tag-based matching | Supabase Postgres + Haiku extraction + Meilisearch |
| 2 | 200-1000 | Add semantic matching on descriptions | + OpenAI embeddings + pgvector |
| 3 | 1000+ | Active matching + collaborative filtering | + Gorse engine + push notifications |

### Cost

- AI extraction per project: ~$0.005 (Haiku)
- 1,000 users × 3 projects each = $15 total extraction cost
- Embedding 1,000 profiles: ~$0.01
- **Matching is essentially free at any reasonable scale**

### Why This Is Better Than Manual Tags

1. **Lower friction** — Users don't fill forms, they share files they already have
2. **More accurate** — AI reads actual project config, not self-reported skills
3. **Richer data** — Project files contain nuance that checkboxes can't capture
4. **Auto-updates** — Re-share when project evolves, profile updates automatically
5. **Works across all tools** — CLAUDE.md, AGENTS.md, .cursorrules, package.json, README

### Fallback for Users Without Project Files

Users who don't have CLAUDE.md or similar can:
- Fill in a lightweight form (type of work + what they need — 2 fields)
- Or: paste a README / project description and let AI extract from that
- Or: link their GitHub repo and let AI analyze the repo structure (Phase 2, not v1)

---

## RISKS

| Risk | Mitigation |
|------|-----------|
| Nobody uses it | Start as a community (5-20 people). Manual matchmaking at first. |
| Vibecoders don't want to collaborate | Research shows they DO want to — but no tools exist for it yet. The "last 20% problem" is real. |
| Someone clones the code and runs | Can't prevent technically, but the value is the live product + revenue + reputation, not the code. |
| Stripe Connect complexity | Express accounts are simple. Well-documented. Many platforms use it. |
| MCP adoption is too niche | Start with web dashboard as primary. MCP is a power-user feature. |
| GitHub dependency | GitHub is where vibecoders already are. Not a risk — it's meeting them where they work. |

---

*This is a first draft. Many decisions are still open. The core idea: vibecoder collaboration platform with shared infrastructure (repo + deploy + revenue) that handles the boring parts so people can focus on building together.*

---

## 16. HOW NON-CODE ROLES WORK ON THE PLATFORM

The platform isn't just for builders who write code. Vibecoders come in every flavor — marketers, designers, PMs, content creators, growth hackers. Here's how they actually use clanka.chat.

### The Key Insight

In the vibe coding era, "non-code" roles still use AI tools. A marketer uses Claude to write copy, plan campaigns, analyze data. A designer uses Cursor to build landing pages. A PM uses ChatGPT to write specs and project plans. **They're all working in environments that can connect to MCP.**

### Example Flows

**Marketer vibecoder (Bob):**
1. Bob joins a project on clanka.chat — Alice built the app, Bob will market it
2. Bob installs `@clanka/mcp` (same as any vibecoder)
3. Bob uses Claude to write a 5-email drip campaign → pushes via `push_deliverable({ type: "content", title: "Launch email sequence", attachments: ["emails.md"] })`
4. Bob sets up Google Ads, then pushes metrics: `push_deliverable({ type: "metric", data: { spend: 50, clicks: 340, signups: 12 } })`
5. Bob writes landing page copy in Cursor, pushes it as code to the shared repo (same flow as a developer)
6. Every week Bob pushes a status update: `push_deliverable({ type: "status", title: "Week 2 marketing update", description: "Launched TikTok campaign, 2.3K impressions, testing 3 ad variants" })`

All of this appears on the project timeline alongside Alice's code commits and deploys.

**Designer vibecoder (Carol):**
1. Carol uses Cursor/Windsurf to build UI components and landing pages → pushes code like a developer
2. Carol creates brand assets (logo, color palette, social templates) → pushes as deliverables with attachments
3. Carol builds an interactive portfolio widget → pushes to canvas via `push_to_canvas`

**PM vibecoder (Dave):**
1. Dave uses Claude to write product specs, user stories, competitive analysis → pushes as content deliverables
2. Dave tracks milestones and decisions → pushes status updates
3. Dave analyzes user feedback and metrics → pushes metric deliverables

### What the Platform Tracks for Non-Code Roles

- **Deliverable count** — How many pieces of work they've pushed
- **Deliverable types** — Content, assets, metrics, status updates
- **Timeline activity** — Visible alongside code contributions
- **Revenue attribution** — Revenue flows through Stripe Connect; split is agreed upon, not auto-calculated by contribution type
- **Reputation** — Projects shipped count, revenue tier badge ($100+, $1K+, $10K+), role tags per project. No collaborator ratings or cross-role scoring.

### What the Platform Does NOT Do

- **Does not judge contribution quality** — The platform records that work happened. Quality is between collaborators.
- **Does not auto-calculate fair splits** — Revenue split is set by mutual agreement. The platform enforces the agreed split, not a "fair" one.
- **Does not restrict roles** — No role dropdown. No "you're a marketer so you can only push content." Anyone can push anything.
- **Does not replace external tools** — Bob still uses Google Ads, Mailchimp, Canva, whatever. The platform tracks the WORK, not the tools.

### Why This Works

1. **Same MCP, same flow** — Every vibecoder installs the same `@clanka/mcp`. The tool doesn't care what role you are.
2. **push_deliverable is universal** — It's like a git commit but for any work. Timestamped, attributed, visible.
3. **AI tools are the environment** — Marketers using Claude, designers using Cursor — they already work in MCP-compatible environments.
4. **Accountability is built in** — If someone joins a project and doesn't push anything, the timeline tells the story.

---

## 17. ROADMAP: CLOUDFLARE WORKERS ECONOMICS & CANVAS COST MODEL (Phase 3)

### Cloudflare Workers for Platforms — Base Plan ($25/month)

**Included:**
- 20,000,000 requests/month
- 60,000,000 CPU-milliseconds/month
- 1,000 scripts (each unique widget = 1 script)

**Overage rates:**
- Requests: $0.30 per million
- CPU time: $0.02 per million CPU-ms
- Scripts: $0.02 per additional script/month

### What 1 Widget Costs

A "widget" = one deployed piece of code on a user's canvas. One iframe slot. It's a Cloudflare Worker script.

Each widget visit = 1 request. A typical widget with light server-side logic uses ~1-5ms CPU per request.

### Scenarios at Scale

**100 users, 3 widgets each (300 scripts):**
- Scripts: 300 (within free 1,000) = $0
- Requests: ~30K/day × 30 = 900K/month (within 20M) = $0
- **Total: $25/month (base plan only)**

**1,000 users, 3 widgets each (3,000 scripts):**
- Scripts: 3,000 − 1,000 free = 2,000 × $0.02 = $40/month
- Requests: ~300K/day × 30 = 9M/month (within 20M) = $0
- **Total: $65/month**

**1,000 users with parameterized templates (500 unique scripts):**
- Scripts: 500 (within free 1,000) = $0
- Requests: same 9M = $0
- **Total: $25/month** ← templates save $40/month

**10,000 users, 3 widgets each (30,000 scripts):**
- Scripts: 30,000 − 1,000 = 29,000 × $0.02 = $580/month
- Requests: ~3M/day × 30 = 90M − 20M free = 70M × $0.30/M = $21
- **Total: $626/month**

**10,000 users with parameterized templates (5,000 unique scripts):**
- Scripts: 5,000 − 1,000 = 4,000 × $0.02 = $80/month
- Requests: same = $21
- **Total: $126/month** ← templates save $500/month

### Parameterized Templates — The Cost Reduction Strategy

Instead of deploying a unique script for every user's widget, users can share parameterized templates:

- **Without templates:** 1,000 users × 3 widgets = 3,000 scripts
- **With templates:** 500 unique templates, each reading per-user config from KV → 500 scripts

How it works:
1. User pushes a widget that matches a known template pattern (e.g., "GitHub activity chart")
2. Platform deploys ONE shared script that reads config from KV: `{ username: "alice", repos: ["app1", "app2"], theme: "dark" }`
3. Same script serves alice's chart and bob's chart — different data, same code
4. 1,000 users using the same template = 1 script, not 1,000

Templates are optional. Users who push fully custom code still get their own script.

### KV/R2/D1 — State Services

Workers are stateless by default. If a widget needs to remember things:

- **KV** (Key-Value): Config storage, user preferences. ~$0.50/M reads, free 100K reads/day.
- **R2** (Object Storage): Files, images, assets. Free egress (!), $0.015/GB/month stored.
- **D1** (SQLite): Structured data, analytics. Free 5M reads/day, 100K writes/day.

For most canvas widgets (dashboards, charts, portfolios), KV is enough. R2 for anything with files. D1 only for widgets that need to query data.

### What a Page View Costs

A "page view" = someone loads your canvas page, which loads your widget iframes. Each iframe = 1 request to Cloudflare.

- 3 widgets on a canvas = 3 requests per page view
- 1,000 page views/day = 3,000 requests/day = 90K/month
- With 20M included, that's 222 users getting 1,000 daily views each before overage kicks in
- **Page views are essentially free at any early scale**

### Deno Subhosting Alternative

If Cloudflare doesn't fit:

| | Cloudflare WfP | Deno Subhosting |
|---|---|---|
| Base cost | $25/month | ~$200/month |
| Memory | 128MB | 512MB |
| Included requests | 20M | Varies by plan |
| Edge locations | 300+ | ~30 |
| Auto-URLs | No (need routing) | Yes (each deploy gets URL) |
| npm support | Bundled only | Native |
| Script limit | 1,000 (then $0.02 each) | No limit on plan |

**Recommendation:** Start with Cloudflare at $25/month. Switch to Deno only if memory limits or DX become a problem.

---

## 18. ROADMAP: QUICKJS / SANDBOX ALTERNATIVES (IF NOT CLOUDFLARE)

If Cloudflare Workers for Platforms isn't the right fit (pricing, limitations, vendor lock-in), here are the alternatives for running untrusted user code:

### QuickJS-in-WASM (Self-Hosted Sandboxing)

Run a JavaScript engine compiled to WebAssembly inside your own infrastructure. The Figma model.

| Package | Stars | DX | Notes |
|---------|-------|-----|-------|
| **quickjs-emscripten** | 1.5K | Low-level | Foundational. Most QuickJS-WASM packages build on this. |
| **@sebastianwessel/quickjs** | Growing | Easiest | v2.0, TypeScript-first, virtual FS, fetch polyfill. Best DX for self-hosting. |
| **Javy** (Bytecode Alliance) | 2K+ | CLI-focused | Used by Shopify in production. Compiles JS → WASM bytecode. |

**Pros:** Full control, no vendor lock-in, runs anywhere (Node.js, Deno, browser, edge).
**Cons:** You manage the sandboxing, execution limits, and scaling yourself. No global edge distribution.

**Cost model:** Infrastructure-only. A $20/month VPS could handle thousands of widget executions. But you're responsible for security, scaling, and uptime.

### Hosted Alternatives

| Service | Model | Base Cost | Memory | Key Feature |
|---------|-------|-----------|--------|-------------|
| **Deno Subhosting** | Managed V8 isolates | ~$200/month | 512MB | Auto-URLs, native npm, good DX |
| **E2B** | Firecracker micro-VMs | Open source / hosted | Full Linux | Run anything (Python, Node, etc.) |
| **Val.town** | Managed V8 isolates | Free tier + paid | 128MB | Reference implementation of "code → live URL" |

### Process-Level Isolation

| Technology | Used By | Model |
|------------|---------|-------|
| **isolated-vm** | Node.js addon | V8 isolate in same process. ⚠️ Maintenance mode. |
| **SES / Hardened JS** | MetaMask Snaps | TC39 proposal. Locks down JS globals. Lightweight but complex. |
| **Firecracker** | AWS Lambda | Micro-VMs with ~125ms boot. Full Linux isolation. Overkill for widgets. |
| **gVisor** | Google Cloud Run | User-space Linux kernel. Between containers and VMs. |

### Decision Matrix

| If you need... | Use... |
|---------------|--------|
| Cheapest start ($25/mo), global edge, managed security | Cloudflare Workers for Platforms |
| More memory (512MB), simpler DX, auto-URLs | Deno Subhosting |
| Full control, no vendor lock-in, self-hosted | @sebastianwessel/quickjs |
| Run non-JS code (Python, etc.) | E2B (Firecracker) |
| Lightweight sandbox in existing Node.js app | SES / Hardened JS |

### Recommendation

**Start with Cloudflare Workers for Platforms.** $25/month, managed security, global edge. If you hit the 128MB memory limit or need more flexibility, evaluate Deno Subhosting. Keep QuickJS-in-WASM as a fallback for self-hosting if costs become a problem at scale.

---

## 19. LISTING CREATION & COLLABORATION FLOW

The full user journey from "I built something" to "we're making money together."

### Phase 1: Listing Creation

**Two paths supported — both website and MCP:**

**Via website (`/new`):**
1. **Vibecoder fills out listing form** on the website — project name, description, roles needed, proposed revenue split, business model, tech stack, project stage, etc.
2. **Preview → Post** — listing goes live on the platform's feed immediately

**Via MCP:**
1. **Vibecoder builds a product** in their environment (Cursor, Claude Code, etc.)
2. **Connects MCP** — installs `@clanka/mcp`, authenticates with their clanka.chat account
3. **User's AI reads project files** (CLAUDE.md, package.json, README, etc.) and generates a listing preview as a markdown document + creates/updates CLANKA.md
4. **User reviews the listing preview** — edits title, description, roles needed, proposed revenue split, business model, tech stack (auto-detected), project stage
5. **User approves** → listing goes live on the platform's feed

**Note:** Listing creation is low-barrier — anyone can post. The real commitment gate is workspace creation, which requires MCP installed + Stripe Connect connected.

**What a listing contains:**
- Project name (required)
- Description (required)
- Role(s) needed — free text, not a dropdown (e.g., "someone to handle marketing and growth", "second coder for backend work")
- Proposed revenue split (required — e.g., "50/50", "60/40 negotiable")
- Business model (required — e.g., "SaaS $29/mo", "marketplace 10% take rate", "one-time purchase $49")
- Tech stack (auto-detected from project files, editable)
- Project stage (e.g., "idea", "building MVP", "MVP live", "has users", "has revenue")
- Domain plan (optional — e.g., "have domain", "need to buy", "subdomain fine")
- Time commitment (optional — e.g., "5-10 hrs/week", "full-time")
- Timezone (optional — for async coordination)

### Phase 2: Discovery & Connection

6. **Other vibecoders browse listings** — filter by role needed, tech stack, project stage, etc.
7. **Interested person sends a connection request** — includes a short message ("I've done X, interested in Y")
8. **Private chat opens** — "Request to Join" opens an ongoing 1:1 private chat between requester and creator. Discussion happens here (or off-platform if they exchange contacts). Not scoped to one request — it's a persistent conversation.
9. **Listing creator can accept or ignore** connection requests

### Phase 3: Terms & Workspace Creation

10. **Both parties agree on terms** (see Section 20 for term structure)
11. **Both parties must have Stripe Connect** connected on their profile — if not, prompted to connect
12. **Workspace is created** — shared project space with 4 grouped tabs:
    - **Timeline** — Chronological activity feed (default view). MCP vs web contributions visually distinct.
    - **Work** — Sub-sections: Code (GitHub repo, commits, PRs, deploy), Marketing (tasks, copy, assets), Management (milestones, decisions log), General (notes, files, links)
    - **Money** — Revenue dashboard, payout history, split breakdown (proportional split bar), agreed terms
    - **CLANKA.md** — Viewer only (editor lives via MCP)
13. **Listing status updates** — shows as "active" with team members. Can be re-listed later if more collaborators are needed

### Phase 4: Building Together

14. **Collaborators work in their own environments** — pushing deliverables, code, and updates via MCP
15. **CLANKA.md stays in sync** — each collaborator's AI maintains their own view, platform merges into unified project state
16. **Code pushed via MCP** → stored on platform's GitHub (private, access per creator's settings)
17. **Deliverables appear on the project timeline** — visible to all workspace members

### Phase 5: Deployment & Revenue

18. **Coder uploads code** via MCP → appears as "ready to deploy" in workspace
19. **Deploy button** → platform deploys to its own Vercel account with Stripe env vars injected
20. **Project goes live** at `projectname.clanka.chat`
21. **Subsequent updates** → coder pushes, optionally enables auto-deploy or clicks deploy manually
22. **Domain options:**
    - Default: `projectname.clanka.chat` (free, platform-controlled)
    - Custom domain: future feature (v2+), complexity around payment protection
23. **Revenue starts flowing** → Stripe processes payments → 48-hour hold → platform splits per agreed terms → 5% platform fee

### Phase 6: Project Page & Growth

24. **Project page** (`clanka.chat/project/coolapp`) shows:
    - Public: project description, team members (by username), project stage, tech stack, business model
    - Public: aggregate stats if team opts in (e.g., "generating revenue", "3 collaborators", "launched 2 weeks ago")
    - Private (team only): detailed revenue, contribution timeline, deploy history, deliverable logs
25. **Re-listing**: active projects can re-list to find additional collaborators — listing shows current project state, existing team, what's needed next

### What Happens If Someone Leaves

- Collaborator (non-creator) leaves: their revenue split stops on future payments. Past earnings are theirs. Access to workspace is revoked.
- Creator leaves: remaining collaborators can request ownership transfer (flagged for platform review). Platform can grant code access to remaining members. This is a manual process in v1, not automated.
- Project dissolution: all collaborators agree to end. Revenue stops flowing. Deployment stays live until hosting expires or someone takes over. Defined as a process but not built as a feature in v1.

---

## 20. TERMS & AGREEMENT STRUCTURE

What collaborators agree to before the workspace is created. The platform requires the essential terms, suggests the rest, and enforces what it can.

### Required Terms (Platform-Enforced)

**Revenue Split** — the only non-negotiable term. Must be set before workspace creation.
- Expressed as percentages that add up to 100% (minus platform's 5%)
- Examples: 50/50, 60/40, 70/30
- Can be changed later by mutual agreement only (both parties confirm in the workspace)
- Platform enforces this via Stripe Connect splits on every transaction

### Suggested Terms (Platform-Prompted, Not Enforced)

The platform prompts collaborators to discuss and agree on these, but doesn't enforce them — they're between the collaborators. Documented in the workspace for reference.

**Expenses:**
- Who pays for what? (Domains, API costs, marketing spend, hosting above platform-included)
- How are shared expenses handled? (Split same as revenue? Different arrangement?)
- The platform records agreed expense terms but doesn't process expense reimbursements in v1

**Commitment Level:**
- Hours per week expected from each collaborator
- Timeline expectations (is this a weekend project or full-time?)
- What constitutes "not pulling your weight"?

**IP Ownership:**
- Who owns the code? (Platform holds it, but who "owns" it legally?)
- What happens to IP if the project dissolves?
- Default suggestion: joint ownership proportional to contribution, but this is between collaborators

**Exit Terms:**
- What happens if one person wants to leave?
- Is there a buyout mechanism?
- How much notice is expected?
- The platform's default: leaving collaborator forfeits future revenue but keeps past earnings and reputation

**Domain Plan:**
- Who buys the custom domain (if any)?
- Who controls DNS? (Platform controls `projectname.clanka.chat` regardless)
- Is this a temporary arrangement or long-term?

### How Terms Work in Practice

1. During private chat (`/messages`), collaborators negotiate terms informally
2. When both accept, the platform presents a terms form with required fields (revenue split) and optional fields (all of the above)
3. Both parties review and confirm the terms
4. Terms are stored in the workspace — visible to both parties at all times
5. Revenue split is immediately active once the workspace is created
6. Other terms are documentation only — the platform doesn't adjudicate disputes about commitment or IP in v1

### What the Platform Does NOT Do

- **Does not provide legal contracts** — these are informal agreements between vibecoders, not legal partnerships. Users who want legal protection should hire a lawyer.
- **Does not mediate disputes** — if collaborators disagree about effort or quality, that's between them. The platform shows the contribution timeline as evidence, but doesn't judge.
- **Does not enforce non-competes** — collaborators can work on competing projects. The platform is a collaboration tool, not an employer.
- **Does not handle taxes** — Stripe Connect provides tax forms. Each collaborator handles their own taxes.
