# Sysboard

Collaborative diagramming tool for software architects. Built with Next.js (fullstack), tldraw (canvas), Liveblocks (realtime), NextAuth.js (auth), Prisma + Postgres (data).

## Stack

- Framework: Next.js 15 + TypeScript + App Router
- Canvas: tldraw
- Realtime collaboration: Liveblocks
- Auth: NextAuth.js
- ORM: Prisma
- Database: Postgres (Supabase)
- Deploy: Vercel (frontend + API) + Supabase (Postgres)
- Icons: lucide-react

## Architecture: Feature-Sliced Design + Next.js App Router

src/app/ is for routing only — pages, layouts, API routes. No business logic here.
All business logic lives in FSD layers under src/.

### FSD slice internal structure

Each slice (in entities/, features/) MUST follow this structure:

slice-name/
ui/ — React components (.tsx)
api/ — fetch functions, API clients (.ts)
model/ — TypeScript types, interfaces (.ts)
hooks/ — React hooks (.ts)
index.ts — public API (re-exports only)

Example — correct:
features/create-board/
ui/CreateBoardModal.tsx
ui/CreateBoardButton.tsx
index.ts

Example — WRONG, never do this:
features/create-board/
CreateBoardModal.tsx ← file in slice root
CreateBoardButton.tsx ← file in slice root
index.ts

Rules:

- NEVER place .tsx or .ts implementation files directly in slice root
- Only index.ts lives in slice root
- Only index.ts is imported from outside the slice
- Internal files import each other directly, never via index.ts
- Create only the subfolders the slice actually needs

Exception — widgets/:
Widgets are compositional. They typically have 1-2 components and do not need subfolders.
Widget slice structure:
  widget-name/
    WidgetName.tsx   — main component
    index.ts         — re-export

### FSD slices

entities/
board/ — Board type, BoardCard component, board API client
user/ — User type (incl. plan), Avatar component, current user hook
workspace/ — Workspace/WorkspaceMember types, workspace API client

features/
create-board/ — create board form, mutation, validation
delete-board/ — delete action, confirmation
share-board/ — share modal, invite flow
board-collab/ — Liveblocks presence, cursors, awareness UI
create-workspace/ — create workspace form + mutation (slug auto-derived from name)
invite-member/ — invite user to workspace/board; auto-creates WorkspaceMember on board invite

widgets/
board-list/ — composes entities/board + features/create-board + features/delete-board
canvas-editor/ — composes tldraw + features/board-collab
dashboard-header/ — top bar for dashboard
workspace-switcher/ — header dropdown to switch active workspace + create new
workspace-sidebar/ — left nav with workspace info, boards, members

shared/
ui/ — Button, Input, Modal, Avatar — no business logic
lib/
auth.ts — NextAuth config
db.ts — Prisma client singleton
liveblocks.ts — Liveblocks server client
constants.ts — UserPlan, PlanLimits, FREE_PLAN, PRO_PLAN, PLAN_LIMITS
styles/
tokens.css — CSS custom properties (design tokens)
global.css — reset and base styles
fonts.css — font imports
types/ — shared TypeScript types

### FSD import rules (strictly enforced)

- app → any layer
- widgets → features, entities, shared
- features → entities, shared
- entities → shared
- shared → nothing above it
- Cross-slice imports within same layer are FORBIDDEN

## Next.js App Router structure

src/app/
(auth)/
sign-in/page.tsx
sign-up/page.tsx
(dashboard)/
page.tsx — boards list
layout.tsx — authenticated layout
board/
[id]/page.tsx — tldraw canvas
api/
auth/[...nextauth]/route.ts
boards/route.ts — GET list, POST create
boards/[id]/route.ts — GET, PATCH, DELETE
liveblocks-auth/route.ts — Liveblocks auth

## Database schema (Prisma)

prisma/schema.prisma

Models:

- User: id, email, name, image, plan (free|pro), createdAt
- Workspace: id, name, slug (unique, auto-derived from name), ownerId (→ User), plan (free|pro), createdAt, updatedAt
- WorkspaceMember: workspaceId (→ Workspace), userId (→ User), role (owner|admin|member), joinedAt
- Board: id, name, workspaceId (→ Workspace), data (Json, tldraw snapshot), createdAt, updatedAt
- BoardMember: boardId (→ Board), userId (→ User), role (editor), joinedAt

Ownership model:
- Boards belong to workspaces, not users directly.
- Workspace owner/admins have implicit access to all boards in the workspace.
- BoardMember is an explicit per-board ACL for non-admin workspace members.
- Inviting a user to a board auto-creates a WorkspaceMember (role: member) if not already present.

## Business constraints

Plan limits (defined in shared/lib/constants.ts, never magic numbers):

FREE:
- 1 workspace per user
- 2 boards per workspace
- 2 concurrent users per board

PRO:
- 5 workspaces per user
- 10 boards per workspace
- 10 concurrent users per board

Enforcement:
- User.plan gates workspace creation — enforced in POST /api/workspaces
- Workspace.plan gates board creation — enforced in POST /api/workspaces/[slug]/boards
- Workspace.plan gates board member count — enforced in /api/liveblocks-auth
- Slug is auto-derived from workspace name (not user-editable)

## Agent roles

### Architect

- Designs interfaces, data models, module boundaries
- Makes technology decisions with explicit tradeoff reasoning
- Does not write implementation code
- Output: TypeScript interfaces, schema definitions, decision rationale

### Frontend Developer

- Implements src/app pages, FSD layers: entities, features, widgets
- Uses SCSS Modules for component and page styling
- Uses shared CSS custom properties from src/shared/styles/tokens.css
- Respects FSD import rules strictly
- Does not write API routes or Prisma queries directly

### Backend Developer

- Implements src/app/api routes, Prisma schema, shared/lib/
- Owns data validation, error handling, business constraint enforcement
- Does not touch UI components

### QA Engineer

- Writes tests, reviews edge cases
- Challenges architectural decisions with failure scenarios
- Signs off before any feature is considered complete

## Code style

- All types explicit, no any
- No default exports (named exports only)
- Async/await over callbacks
- Errors are typed, never silently swallowed
- Each file has single responsibility
- Styling: SCSS Modules for components/pages. Global CSS is limited to reset, fonts, and design tokens.

## Design system

Tokens defined in src/shared/styles/tokens.css (source of truth — CSS custom properties).
Fonts: Onest (body, all UI), Fira Code (mono — IDs, props, technical data).

Use SCSS Modules and refer to tokens directly:
- Colors: `var(--bg-canvas)`, `var(--text-primary)`, `var(--accent)`, `var(--border-default)`
- Radius: `var(--r-sm)`, `var(--r-md)`, `var(--r-lg)`, `var(--r-xl)`
- Spacing: `var(--sp-1)` through `var(--sp-12)`
- Shadows: `var(--shadow-node)`, `var(--shadow-panel)`, `var(--shadow-elevated)`

### Node colors (for diagram elements)
Use `var(--node-service)`, `var(--node-database)`, `var(--node-queue)`, `var(--node-cache)`, `var(--node-cdn)`.

## What we are NOT building (MVP)

- Subscription or payment logic (plan field exists, but no billing flow)
- Mobile support
- Public sharing without auth

## Response style

- After completing a task: one short summary (max 5 lines), no explanations unless asked
- No "Here's what I did" intros
- No bullet lists of every file touched unless explicitly requested
- If something needs clarification: ask one question, not multiple
- Code only when asked for code review — otherwise just do the task
- Never print file contents or code snippets after completing a task
- Never show diffs or before/after comparisons unless explicitly asked
- Only confirm what was created/changed in one line per file
