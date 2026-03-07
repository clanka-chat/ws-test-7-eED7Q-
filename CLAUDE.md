# CLAUDE.md — clanka.chat Hackathon Build Guide

## First: Read These Three Files

Before writing ANY code, read these files completely. They are the single source of truth. This file is just a pointer — all specs, code patterns, SQL, and design tokens live in those docs.

1. **`docs/hackathon-plan.md`** — Everything: database schema (10 tables with full SQL), API routes, Supabase client code, auth middleware code, MCP server implementation, build order, Tailwind config, seed data
2. **`docs/project-outline-v1.md`** — Architecture decisions (1-23), data model rationale, MCP design, collaboration flows
3. **`docs/design-discovery.md`** — Brand, color palette, typography, component patterns, page layouts, animation specs

Do NOT rely on summaries below. Go read the actual files.

---

## Multi-Agent Setup

This project is built by TWO agents working in parallel. Read your `CLAUDE.local.md` to know your role.

- **Agent 1 (Backend)** works in the `main/` folder — schema, auth, API routes, server actions, types, lib/
- **Agent 2 (Frontend)** works in the `frontend/` worktree — components, pages, styling, tailwind config

### Rules for Both Agents
- ONLY edit files in your designated area (see CLAUDE.local.md)
- If you need something the other agent builds, create a placeholder type in `types/placeholders.ts` and move on
- Commit after completing each task or sub-phase
- Do not add unnecessary comments or jsdocs
- Do not use `any` or `unknown` types
- Run typecheck after each file to avoid accumulating errors
- Follow the patterns in the docs exactly — do not improvise

### Merge Cycle
The human merges branches every 45-60 minutes. After a merge:
- You may see new files from the other agent — use them as-is, don't modify them
- If something doesn't match what you expected, ask the human

---

## Project Setup

```bash
npx create-next-app@latest main --typescript --tailwind --app --src-dir
cd main
git init
```

```bash
npm install @supabase/supabase-js @supabase/ssr nanoid slugify octokit @octokit/app @octokit/webhooks lucide-react
npm install -D supabase
```

`.env.local` — 9 variables. See `hackathon-plan.md` → "Environment Variables" section for full list with descriptions.

---

## Build Order

Follow `hackathon-plan.md` → "Hackathon Build Order" section. There are **6 phases, 31 numbered items**. Work phase by phase, commit after each.

**IMPORTANT — Phase 4 onward: Item-by-item workflow.**
Starting from Phase 4, we build ONE numbered item at a time. The human will tell you which specific item to build (e.g., "Do Item 16 — Messages"). Build ONLY that item, nothing else. Do NOT build the next item — the human will test in the browser first and come back with instructions for the next item.

When the human says "Do Item X":
1. Open `hackathon-plan.md` and find that item
2. Read every referenced section (schema, API routes, relevant tables, etc.)
3. Read `design-discovery.md` for any UI you're building
4. Build ONLY that item — nothing more
5. Only build parts that belong to YOUR role (see CLAUDE.local.md)
6. Run `tsc --noEmit` and commit when done
7. WAIT — do not proceed to the next item

---

## What's Mocked vs Real

Only **Stripe** is mocked (button toggles `stripe_connected`, fake earnings). Everything else is real — GitHub repos, Vercel deploys, MCP server, auth, all 10 database tables. See `hackathon-plan.md` → "What's Mocked vs Real" for the full table.

---

## Skills Available

Use these as checkpoints AFTER building, not during:
- `/commit` — clean commit messages after each feature
- `/code-review` — check for security, correctness, maintainability
- `/auth-patterns` — verify auth implementation against common vulnerabilities
- `/supabase-rls-gen` — generate RLS policies after creating tables
- `/react-performance` — catch performance issues before they compound
- `/pr-review` — full audit before merging (runs 5 parallel checks)
- `/typescript` — strict type checking, no `any`

---

## If Something Isn't In The Docs

Ask the human. Don't assume.
