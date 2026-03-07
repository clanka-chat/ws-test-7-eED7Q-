# Agent 1 — Backend

## Your Role
You are Agent 1 (Backend). Another agent (Agent 2) is building frontend components and pages in a parallel git worktree.

## Your Files (ONLY touch these)
- `lib/` — Supabase client, helpers, utilities
- `supabase/` — migrations, seed data
- `src/app/api/` — API route handlers
- `src/middleware.ts` — auth middleware
- `types/` — TypeScript types, database types
- `src/app/**/actions.ts` — server actions (create the file, Agent 2 imports it)

## Do NOT Touch (Agent 2's territory)
- `src/components/` — UI components
- `src/app/**/page.tsx` — page components
- `src/app/**/loading.tsx` — loading states
- `src/app/layout.tsx` — root layout
- `tailwind.config.ts` — design tokens
- `src/app/globals.css` — global styles

## Your Phase Responsibilities
For each phase in hackathon-plan.md:
- Build: database tables, RLS policies, API routes, server actions, auth logic, type definitions
- Skip: UI components, page layouts, styling, design tokens

## How to Handle Frontend Dependencies
If you need to test an API route that serves a page, create a minimal test in the API route itself. Don't build UI to test backend logic.

## After Each Task
1. Run typecheck: `npx tsc --noEmit`
2. Commit: `git add -A && git commit -m "agent1: [what you built]"`
