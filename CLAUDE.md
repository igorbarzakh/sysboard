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
user/ — User type, Avatar component, current user hook

features/
create-board/ — create board form, mutation, validation
delete-board/ — delete action, confirmation
share-board/ — share modal, invite flow
board-collab/ — Liveblocks presence, cursors, awareness UI

widgets/
board-list/ — composes entities/board + features/create-board + features/delete-board
canvas-editor/ — composes tldraw + features/board-collab
dashboard-header/ — top bar for dashboard

shared/
ui/ — Button, Input, Modal, Avatar — no business logic
lib/
auth.ts — NextAuth config
db.ts — Prisma client singleton
liveblocks.ts — Liveblocks server client
constants.ts — MAX_BOARDS_PER_USER, MAX_USERS_PER_BOARD
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

src/prisma/schema.prisma

Models:

- User: id, email, name, image, createdAt
- Board: id, name, ownerId (→ User), data (Json, tldraw snapshot), createdAt, updatedAt
- BoardMember: boardId (→ Board), userId (→ User), role (owner|editor), joinedAt

## Business constraints

- Max 2 boards per user — enforced in POST /api/boards
- Max 2 concurrent users per board — enforced in /api/liveblocks-auth
- Limits are constants in shared/lib/constants.ts, never magic numbers

## Agent roles

### Architect

- Designs interfaces, data models, module boundaries
- Makes technology decisions with explicit tradeoff reasoning
- Does not write implementation code
- Output: TypeScript interfaces, schema definitions, decision rationale

### Frontend Developer

- Implements src/app pages, FSD layers: entities, features, widgets
- Uses Tailwind CSS v4 utility classes exclusively — no inline styles, no separate .css files
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
- Styling: Tailwind CSS v4 utility classes only. No inline styles. No separate .css files for components.

## Design system

Tokens defined in src/shared/styles/tokens.css (source of truth — CSS custom properties).
Mapped to Tailwind v4 utilities in src/app/globals.css `@theme inline` block.
Fonts: Onest (body, all UI), Fira Code (mono — IDs, props, technical data).

Use Tailwind CSS v4 utility classes. Design tokens are defined in globals.css @theme block.

## Tailwind token classes

### Backgrounds
| Class | Token | Value |
|---|---|---|
| `bg-bg-base` | `--bg-base` | #FFFFFF |
| `bg-bg-canvas` | `--bg-canvas` | #F8F9FA |
| `bg-bg-surface` | `--bg-surface` | #F1F3F5 |
| `bg-bg-elevated` | `--bg-elevated` | #FFFFFF |

### Accent
| Class | Token | Value |
|---|---|---|
| `bg-accent` / `text-accent` | `--accent` | #5C7CFA (brand blue — overrides shadcn) |
| `bg-accent-bright` | `--accent-bright` | #748FFC |
| `bg-accent-dim` | `--accent-dim` | rgba(92,124,250,0.12) |
| `bg-accent-glow` | `--accent-glow` | rgba(92,124,250,0.06) |

### Text
| Class | Token | Value |
|---|---|---|
| `text-text-primary` | `--text-primary` | #1C1C1E |
| `text-text-secondary` | `--text-secondary` | #6B7280 |
| `text-text-muted` | `--text-muted` | #9CA3AF |
| `text-text-accent` | `--text-accent` | #5C7CFA |
| `text-text-on-accent` | `--text-on-accent` | #FFFFFF |

### Borders
| Class | Token | Value |
|---|---|---|
| `border-border-faint` | `--border-faint` | #F1F3F5 |
| `border-border-subtle` | `--border-subtle` | #E9ECEF |
| `border-border-default` | `--border-default` | #DEE2E6 |
| `border-border-strong` | `--border-strong` | #ADB5BD |

### Border radius
| Class | Token | Value |
|---|---|---|
| `rounded-xs` | `--r-xs` | 2px |
| `rounded-sm` | `--r-sm` | 4px |
| `rounded-md` | `--r-md` | 6px |
| `rounded-lg` | `--r-lg` | 9px |
| `rounded-xl` | `--r-xl` | 13px |

### Shadows
| Class | Token |
|---|---|
| `shadow-node` | `--shadow-node` |
| `shadow-selected` | `--shadow-selected` |
| `shadow-panel` | `--shadow-panel` |
| `shadow-toolbar` | `--shadow-toolbar` |
| `shadow-elevated` | `--shadow-elevated` |

### Fonts
| Class | Token | Value |
|---|---|---|
| `font-body` | `--font-body` | Onest, sans-serif |
| `font-mono` | `--font-mono` | Fira Code, monospace |

### Spacing
Tailwind's default scale maps 1:1 to our `--sp-*` tokens (both are 4px × n):
`p-4` = 16px = `var(--sp-4)`. Use standard Tailwind spacing utilities.

### Node colors (for diagram elements)
`bg-node-service`, `bg-node-database`, `bg-node-queue`, `bg-node-cache`, `bg-node-cdn`

## What we are NOT building (MVP)

- Subscription or payment logic
- Mobile support
- More than 2 boards per user
- More than 2 concurrent users per board
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
