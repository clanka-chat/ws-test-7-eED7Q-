# clanka.chat — Design Discovery

**Status**: Complete
**Date**: March 5, 2026
**Goal**: Define brand, visual direction, and design system for clanka.chat

---

## Step 1: Brand Foundation
**Status**: Complete
**Skills used**: `brand-identity`, `brand-voice`

### Brand Identity

**Brand Purpose:**
"To make it easy for people who build with AI to find each other and ship things together."

**Brand Values (3):**
1. **Simplicity** — Everything should feel obvious. No learning curve, no enterprise complexity. Post a listing, find someone, start building.
2. **Transparency** — Revenue splits are visible, contributions are tracked automatically, terms are upfront. No hidden dynamics.
3. **Human connection** — This isn't a marketplace with transactions. It's people finding people to build with. The platform gets out of the way.

**Brand Personality:**
- Playful (not serious)
- Casual (not formal)
- Confident (not reserved)
- Modern (not traditional)
- Understated (not bold)

*"If clanka were a person at a party, they'd be the one casually showing you something cool they built on their phone — not pitching you, just genuinely excited. They're easy to talk to, don't take themselves too seriously, but clearly know what they're doing. They'd rather show you than tell you."*

**Target Audience:**
Vibecoders — anyone who uses AI to build things. From Cursor power users to someone who just discovered Bolt last week. Skews younger, indie, non-corporate. Values speed over process, shipping over planning.

### Brand Voice

**Voice (3 words):** Casual, direct, encouraging

**Formality:** Informal. Like a friend who's a few steps ahead of you, not a company talking down.

**Humor:** Light, not forced. Occasional wit. Never sarcastic toward users.

**Vocabulary:**
- Use: ship, build, co-builder, split, push, launch, vibecoder, micro-startup, collaborate
- Avoid: leverage, synergy, ecosystem, disrupting, utilize, revolutionary, AI-powered (overused), cutting-edge, best-in-class, scalable solution
- Contractions always. "You'll" not "You will."

**Writing rules:**
- Lead with the point, then explain
- Short sentences. 2-3 sentence paragraphs max.
- Bullet points over walls of text
- Bold key phrases for scanners
- No exclamation mark spam

**Tone by context:**

| Context | Tone | Example |
|---|---|---|
| Marketing/landing | Confident, benefit-first | "Find a co-builder, ship a product, split the revenue." |
| Onboarding | Warm, clear, no jargon | "First, tell us what you're building. Then we'll help you find someone to build it with." |
| Error states | Calm, helpful | "That didn't work. Here's what to try." |
| Success moments | Genuine, not over-the-top | "You're live. Payouts are sent every 48 hours." |
| Empty states | Encouraging, actionable | "No projects yet. Post your first listing — it takes 2 minutes." |

**Good examples:**
- "Ship together. Split the money. Keep building."
- "You built 80% of an app. Someone else can nail the last 20%."
- "Free to use. 5% on revenue that flows through."

**Bad examples:**
- "Welcome to the future of collaborative AI-powered development!"
- "Leverage our innovative platform to synergize with like-minded builders."
- "HUGE UPDATE! We just launched something AMAZING!!!"

---

## Step 2: Visual Direction
**Status**: Complete
**Skills used**: `visual-concept` (not applicable — music video focused), `web-design-pro` (not applicable — Korean game portfolio), `awwwards-design` (useful — principles and references extracted)

### Reference Vibe
Linear + Vercel + Raycast — clean product sites that feel premium but not corporate. Not flashy creative agency. Not terminal aesthetic.

### Color Palette

| Role | Value | Usage |
|---|---|---|
| Background | `#0A0A0B` (deep dark, not pure black) | Page background |
| Surface | `#141415` | Cards, modals, elevated elements |
| Primary accent | Warm amber/orange (TBD exact hex — e.g. `#F59E0B` or `#FB923C`) | CTAs, highlights, key UI elements |
| Text primary | `#EDEDEF` (off-white) | Body text |
| Text heading | `#FFFFFF` | Headings |
| Text muted | `#888888` | Secondary info, timestamps, labels |
| Success | Green (TBD) | Deployed, earning, connected |
| Error | Red (TBD) | Failures, warnings |

### Typography

| Role | Font | Notes |
|---|---|---|
| Headings | Satoshi (Bold / Black) | Modern geometric, warm personality |
| Body | Satoshi (Regular / Medium) | Same family, readable at small sizes |
| Monospace | JetBrains Mono | Code-adjacent elements, tags, stats |

Rules:
- Two typefaces max (heading + body, or one for both if versatile enough)
- All from Google Fonts or similarly free/open
- Define size scale: H1-H3, body, small, caption

### Layout Philosophy
- Clean grid, generous whitespace
- Cards as primary UI pattern (listings, projects, workspace sections)
- Dark glassmorphism for modals and overlays
- Mobile-responsive, desktop-first
- No heavy animations — keep it fast

### Texture & Effects
- Subtle grain overlay on backgrounds (adds warmth, prevents flat feel)
- Soft gradients on hero/key sections (static, not animated)
- Layered soft shadows for depth on cards
- Frosted glass (`backdrop-filter: blur`) for modals over content

### What We Skip
- Custom cursors — unnecessary for a product platform
- WebGL / 3D — overkill, hurts performance
- Heavy scroll animations — slows down getting to the point
- Parallax — distracting for daily-use tool
- Horizontal scroll sections — confusing
- Text splitting animations — fun but too flashy for our understated personality
- Animated gradients — too distracting

### Subtle Animations We DO Use
- Fade + slight upward reveal on scroll (elements entering viewport)
- Smooth page transitions (crossfade)
- Hover states on all interactive elements (scale, opacity, or color shift)
- Smooth loading states (skeleton screens, not spinners)

### Decisions Made
- **Primary accent:** Warm amber/orange (exact hex TBD during implementation)
- **Typography:** Satoshi for headings + body, JetBrains Mono for monospace

---

## Step 3: Landing Page Design
**Status**: Complete
**Skills used**: `landing-page-design` (conversion framework applied), `landing-page-roast` (self-critique applied)

### Landing Page Section Order (revised after roast)

**Section 1 — Hero**
- Problem-first headline. Candidates:
  - "You built 80% of the app. Find someone to finish it with."
  - "Stop building alone."
  - "Build together. Ship faster. Split the revenue."
- Subtext: 1-2 sentences — what clanka is, who it's for
- "Free to use" visible near hero — "We only take 5% when you earn."
- Primary CTA: "Post Your Project" (creator-first, not browser-first)
- Secondary CTA: "Browse Projects" (text link or secondary button)
- No hero image — clean text-focused hero with subtle gradient. No stock photos.

**Section 2 — How It Works**
- 3-4 step visual flow:
  1. Post a listing (describe what you're building, what help you need)
  2. Find a co-builder (browse or get matched)
  3. Agree on terms (revenue split, roles, commitment)
  4. Ship & earn (platform handles repos, deploys, payments)

**Section 3 — What the platform handles**
- "You build. We handle the infrastructure."
- Repos (platform-controlled GitHub)
- Deploys (one-click via Vercel)
- Revenue splitting (Stripe Connect, automatic payouts every 48h)
- Contribution tracking (automatic, across all roles)

**Section 4 — The problem**
- The Last 20% — "You built most of the app but can't finish deployment/auth/payments alone"
- Building alone is slow and lonely
- No tools exist for "I'm stuck, help me finish this"
- Fiverr/Upwork are transactional — this is collaborative

**Section 5 — Who it's for**
- What a vibecoder is — not just coders. Marketers, designers, PMs, anyone who uses AI to build.
- "You don't need to be an expert. If you use AI to make things, you belong here."
- Welcome newcomers explicitly

**Section 6 — Pricing**
- "Free to use. 5% on revenue that flows through the platform."
- What the 5% covers: repos, deploys, revenue processing, contribution tracking
- No tiers, no upsells. One model.
- Also accessible as modal when triggered from buttons elsewhere

**Section 7 — FAQ**
- What is a vibecoder?
- Do I need to know how to code?
- How does revenue splitting work?
- What happens if someone leaves a project?
- Is it really free?
- How do I get started?
- What if I just have an idea but haven't built anything?

**Section 8 — Footer CTA**
- Repeat primary CTA: "Post Your Project" or "Sign Up"
- Brief value reminder
- Links: About, Terms, Privacy

### Roast Findings (applied above)

| Issue | Score | Fix applied |
|---|---|---|
| Clarity above fold | 6/10 | Problem-first headline, not solution-first |
| Audience fit | 5/10 | Moved vibecoder explanation to Section 5, not Section 2 |
| Offer strength | 4/10 | "Free" surfaced near hero, not buried |
| Trust layer | 3/10 | Biggest gap — need founder story or live activity count at launch |
| Friction | 7/10 | "Post Your Project" as primary CTA instead of "Browse" |
| Objection handling | 6/10 | "What if someone leaves?" in FAQ, trust addressed in platform section |

### Trust Strategy (launch)
**Decision:** Dogfood the product. Clanka itself is a listing on clanka.
- The platform is looking for collaborators — this project is listed as a real project on the platform
- Founder story: "Built by [name], a vibecoder tired of building alone. This platform is our first listing."
- Building in public: link to project outline, show transparency
- This solves the empty-platform problem AND the trust problem simultaneously

### Open Questions
- Exact headline copy — test multiple variants
- Hero visual — gradient only, or subtle illustration/animation?
- Trust element — which approach for launch?

---

## Step 4: App Design System
**Status**: Complete
**Skills used**: `ui-ux-design-pro` (domain exploration + direction framework), `design-system` (token architecture)

### Domain Exploration

**Domain concepts:** Co-building, shipping, splitting, matching, workspaces, listings, contribution tracking, revenue flow, collaboration, micro-startups, handoff

**Color world:** A coworking space late at night — warm desk lamps (amber), dark walls, laptop screens glowing, whiteboards with sketches, coffee cups. Focused warmth in darkness.

**Signature element:** The revenue split visualization — a proportional bar showing who gets what percentage. This is the visual symbol of "split the revenue." Appears on listings, workspace, project pages.

**Defaults rejected:**
1. Generic sidebar + cards dashboard → Instead: timeline-first workspace
2. Blue accent → Instead: warm amber
3. Standard profile (avatar + bio) → Instead: project grid + contribution activity

### Design Direction: Warmth & Approachability
Generous spacing, soft shadows. Collaborative tool, not enterprise dashboard. Feels like a coworking space at night — warm, focused, inviting.

### Design Tokens (Three-Tier Architecture)

**Primitive → Semantic → Component**

#### Colors (Dark Mode Primary)

| Semantic Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#0A0A0B` | Page background |
| `--bg-surface` | `#141415` | Cards, sections |
| `--bg-elevated` | `#1C1C1E` | Dropdowns, modals |
| `--bg-input` | `#0F0F10` | Form inputs (inset feel) |
| `--text-primary` | `#EDEDEF` | Body text |
| `--text-heading` | `#FFFFFF` | Headings |
| `--text-secondary` | `#A0A0A5` | Descriptions, labels |
| `--text-muted` | `#666668` | Timestamps, placeholders |
| `--accent-primary` | `#F59E0B` | Amber — CTAs, highlights, active states |
| `--accent-hover` | `#FBBF24` | Lighter amber on hover |
| `--accent-muted` | `rgba(245, 158, 11, 0.15)` | Amber tint for badges, backgrounds |
| `--border-default` | `rgba(255, 255, 255, 0.08)` | Card borders, dividers |
| `--border-subtle` | `rgba(255, 255, 255, 0.04)` | Faint separators |
| `--border-strong` | `rgba(255, 255, 255, 0.15)` | Focus rings, emphasis |
| `--status-success` | `#22C55E` | Deployed, earning, connected |
| `--status-error` | `#EF4444` | Failures, warnings |
| `--status-info` | `#3B82F6` | Informational |

#### Typography Scale

| Token | Size | Weight | Use |
|---|---|---|---|
| `--text-hero` | `clamp(2.5rem, 5vw, 4rem)` | 800 (Black) | Landing hero headline |
| `--text-h1` | `2rem` (32px) | 700 (Bold) | Page titles |
| `--text-h2` | `1.5rem` (24px) | 700 | Section headings |
| `--text-h3` | `1.25rem` (20px) | 600 (SemiBold) | Card titles, subsections |
| `--text-body` | `1rem` (16px) | 400 (Regular) | Body text |
| `--text-small` | `0.875rem` (14px) | 400 | Labels, secondary text |
| `--text-caption` | `0.75rem` (12px) | 500 (Medium) | Timestamps, badges, tags |
| `--text-mono` | `0.875rem` (14px) | 400 | Code, stats, tech stack tags |

Font stack:
- Sans: `'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif`
- Mono: `'JetBrains Mono', 'Fira Code', monospace`

#### Spacing Scale (4px base)

| Token | Value | Use |
|---|---|---|
| `--space-1` | `4px` | Icon gaps, tight padding |
| `--space-2` | `8px` | Inside tags, between inline elements |
| `--space-3` | `12px` | Input padding, small gaps |
| `--space-4` | `16px` | Card padding, between items |
| `--space-6` | `24px` | Section padding, between cards |
| `--space-8` | `32px` | Between major sections |
| `--space-12` | `48px` | Page section gaps |
| `--space-16` | `64px` | Landing page section spacing |

#### Border Radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `6px` | Tags, badges, small elements |
| `--radius-md` | `8px` | Buttons, inputs |
| `--radius-lg` | `12px` | Cards |
| `--radius-xl` | `16px` | Modals, larger containers |

#### Depth Strategy: Soft Shadows + Borders
- Cards: subtle border (`--border-default`) + very soft shadow
- Modals: frosted glass (`backdrop-filter: blur(12px)`) + border
- Dropdowns: one level above parent, stronger shadow
- No dramatic shadows anywhere

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.25);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.3);
```

### Component Patterns

#### Buttons
| Variant | Style |
|---|---|
| Primary | Amber bg, dark text, hover: lighter amber |
| Secondary | Transparent + border, amber text, hover: amber bg tint |
| Ghost | No border, text only, hover: subtle bg |
| Danger | Red variant for destructive actions |
| Sizes: `sm` (32px), `md` (40px), `lg` (48px) |

#### Cards (Listing Card, Project Card, Workspace Card)
- `--bg-surface` background
- `--border-default` border
- `--radius-lg` corners
- `--space-4` internal padding
- Hover: border brightens to `--border-strong`, slight scale (1.01)

#### Modals (Project Page, Pricing)
- Frosted glass overlay (`backdrop-filter: blur(12px)`)
- `--bg-elevated` surface
- `--radius-xl` corners
- Centered, max-width 640px (content modals) or 480px (forms)

#### Forms
- `--bg-input` background (slightly darker — inset feel)
- `--border-default` border, `--border-strong` on focus
- Amber focus ring
- Inline validation
- Labels above inputs, not floating

#### Navigation
- Transparent bg with border-bottom
- Blur on scroll (`backdrop-filter`)
- Sticky top
- Logo left, nav center, auth right

#### Tags / Badges
- `--radius-sm` rounded
- `--accent-muted` background for highlight tags
- `--bg-surface` for neutral tags
- Monospace font for tech stack tags

#### Deploy Status Indicator
- Inline in workspace Code tab, next to Deploy button
- States map to colors: Queued → `--text-muted`, Building → `--accent-primary` (amber pulse), Live → `--status-success`, Failed → `--status-error`
- Shows timestamp + URL link when live: "Deployed 2 min ago · [View →](url)"
- Deploy button: Primary amber when available, disabled while building

#### API Key Display (Settings)
- Settings → Profile section includes "API Key" subsection
- Generated key shown once in monospace (`JetBrains Mono`), copyable, masked after first view
- "Regenerate" button with confirmation (Danger variant)
- Helper text: "Use this key to connect your MCP server"

#### GitHub Activity in Workspace
- Commits shown in Timeline tab with GitHub icon + source indicator
- Commit entries: monospace hash, message, author avatar, timestamp
- PR entries: title, status badge (open/merged/closed), author
- Source badges: "via MCP" (amber tint), "via GitHub" (neutral), "via web" (neutral) — visually distinct per UX audit finding #6

### Key Page Layouts

**Explore (`/explore`):**
- Top: filter bar (horizontal, collapsible on mobile)
- Below: responsive card grid (3 cols desktop, 2 tablet, 1 mobile)
- Card click → project modal overlay

**Dashboard (`/dashboard`):**
- No sidebar. Clean single-column or two-column layout.
- Left/main: your active projects as cards + activity feed
- Right/aside: notifications, connection requests
- Mobile: stacked single column

**Workspace (`/project/[slug]/workspace`):**
- Top: project name + team avatars + tabs
- Tabs (4 grouped): **Timeline** | **Work** (Code, Marketing, Management sub-sections) | **Money** (Financials, Terms) | **CLANKA.md**
- Timeline (default): chronological activity feed with collaborator sections. GitHub commits and MCP updates shown with source badges.
- Work → Code: GitHub repo link, commit list, PR list, **Deploy button + status indicator** (inline, not separate tab), live URL when deployed
- Each tab: relevant content, no sidebar needed
- Empty states: encouraging copy + action for each section

**Profile (`/u/[username]`):**
- Top: avatar + name + bio + skills tags + Stripe badge
- Below: project cards grid (active + completed)
- Below that: contribution activity (GitHub-style heatmap adapted for all roles)
- Reputation indicators inline with profile header

**Settings (`/settings`):**
- Left: section nav (Profile, Accounts, Payments, Notifications, Privacy, Danger Zone)
- Right: active section content
- **Profile section**: bio, skills, roles, avatar
- **Accounts section**:
  - **GitHub Username** — text input, saved to `profiles.github_username`. Required for code-access collaborators before workspace creation. Helper text: "Your GitHub username. Required if you'll have code access to projects." Shows ✓ if set, warning badge if empty and user has code-access projects pending.
  - **MCP API Key** — generate/regenerate key for MCP auth (monospace display, copyable, masked after first view). "Regenerate" button with Danger variant confirmation.
  - **Stripe Connect** — "Connect Stripe" button (mocked for hackathon, toggles `stripe_connected`)
- Standard settings pattern — nothing flashy needed here

### Animation Spec
| Element | Duration | Easing |
|---|---|---|
| Hover transitions | 150ms | `ease-out` |
| Modal open/close | 250ms | `ease-in-out` |
| Scroll reveal | 400ms | `power3.out` |
| Page transitions | 300ms | `ease-in-out` |
| Skeleton loading | continuous | `ease-in-out` pulse |

Respect `prefers-reduced-motion`. GPU-friendly: `transform` and `opacity` only.

---

## Step 5: Polish & Audit
**Status**: Complete
**Skills used**: `ux-audit` (flow audit), `anti-slop-design` (generic detection)

### UX Audit — Flow Issues Found

**Flow 1: New visitor → First listing**
- WARN: Post-signup profile completion may cause drop-off. Fix: let users post listing or browse BEFORE forcing profile setup. Nudge, don't gate.

**Flow 2: Find a co-builder**
- FIXED: After "Request to Join" — requester sees confirmation, pending request on dashboard, notification when creator responds.
- FIXED: Messaging is ongoing private chat (not limited to negotiation). Starts from connection request, continues as long as needed.
- FIXED: Terms flow — creator presents final terms via platform form, collaborator accepts, workspace created.

**Flow 3: Workspace usage**
- WARN: 7 tabs is too many. Regroup to 4: **Timeline | Work | Money | CLANKA.md** (Work contains Code/Marketing/Management sub-sections. Money contains Financials/Terms.)
- WARN: Empty workspace states needed — each section needs an encouraging empty state.
- WARN: MCP-pushed work should be visually distinct from web-added work.

**Flow 4: Revenue payout**
- WARN: Dashboard needs total cross-project earnings summary, not just per-workspace.

### Priority Fixes (applied to design)

| # | Fix | Where |
|---|---|---|
| 1 | Post-signup: nudge profile, don't gate | Auth flow |
| 2 | Define "Request to Join" → pending state + dashboard section | Explore + Dashboard |
| 3 | Reduce workspace tabs: 7 → 4 grouped tabs | Workspace |
| 4 | Design empty states for all workspace sections | Workspace |
| 5 | Add cross-project earnings to dashboard | Dashboard |
| 6 | Visual indicator for MCP vs web contributions | Workspace timeline |

### Anti-Slop Check

| Check | Status |
|---|---|
| Not using Inter/Roboto/Arial? | PASS — Satoshi |
| No purple gradient? | PASS — amber on dark |
| Varied border-radius? | PASS — 4-level scale |
| Layout not just centered-everything? | WATCH — ensure asymmetry in implementation |
| Signature element present? | PASS — revenue split bar |
| Wouldn't be mistaken for generic AI output? | PASS with caveats — amber + grain + split bar differentiate, but dark card grid is common. Stay intentional.

---

## Notes

- Each step feeds into the next — don't skip ahead
- Brand identity must be done before visual direction
- Visual direction must be done before landing page or design system
- Landing page and app design system can run in parallel after Step 2
- Results from each step get written back into website-structure.md
