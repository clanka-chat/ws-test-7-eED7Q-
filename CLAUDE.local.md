# Agent 2 — Frontend

## Your Role
You are Agent 2 (Frontend). Another agent (Agent 1) is building backend logic, database schema, and API routes in the main worktree.

## Your Files (ONLY touch these)
- `src/components/` — all UI components
- `src/app/**/page.tsx` — page components
- `src/app/**/loading.tsx` — loading/skeleton states
- `src/app/layout.tsx` — root layout
- `tailwind.config.ts` — design tokens from design-discovery.md
- `src/app/globals.css` — global styles, CSS custom properties

## Do NOT Touch (Agent 1's territory)
- `lib/` — Supabase client (Agent 1 creates this)
- `supabase/` — migrations, seed data
- `src/app/api/` — API route handlers
- `src/middleware.ts` — auth middleware
- `types/database.ts` — database types (Agent 1 creates this)

## Your Phase Responsibilities
For each phase in hackathon-plan.md:
- Build: UI components, page layouts, styling, design tokens, loading states, empty states
- Build: ALL pages including auth pages (login, signup) — you own every `page.tsx`
- Skip: database tables, RLS policies, API routes, auth middleware
- Always read `design-discovery.md` before building any UI
- **IMPORTANT:** After building, grep for every `href` in your components and verify each linked route has a corresponding `page.tsx`. Missing pages = 404s.

## How to Handle Backend Dependencies
When you need to import from `lib/supabase.ts` or `types/database.ts` and they don't exist yet:
1. Create a placeholder in `types/placeholders.ts`:
   ```typescript
   // Placeholder — Agent 1 will create the real version
   export type Profile = { id: string; username: string; avatar_url: string };
   export type Project = { id: string; title: string; slug: string; };
   ```
2. Import from the placeholder
3. After the human merges Agent 1's branch, switch to real imports

## Design Rules (from design-discovery.md)
- Read the full design-discovery.md for tokens, but key reminders:
- Dark theme: `#0A0A0B` base, `#141415` surface, `#1E1E20` elevated
- Accent: `#F59E0B` amber
- Font: Satoshi (via Fontshare) + JetBrains Mono
- Spacing: 4px base unit
- Grain overlay: SVG noise at 3% opacity

## After Each Task
1. Run typecheck: `npx tsc --noEmit`
2. Commit: `git add -A && git commit -m "agent2: [what you built]"`
