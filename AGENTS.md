<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses Next.js 16.2.3 with breaking changes. APIs, conventions, and file structure may differ from model training data. Before changing Next.js-specific code, read the relevant local guide in `node_modules/next/dist/docs/`. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sysboard Agent Handbook

This file is the source of truth for AI agents working in this repository. Keep it short enough to follow, but strict enough to prevent architecture drift.

## Product

Sysboard is a collaborative system-design board for software architects.

Core stack:

- Next.js 16.2.3 App Router, React 19, TypeScript strict mode.
- tldraw for the canvas editor.
- Liveblocks for realtime collaboration.
- NextAuth.js for authentication.
- Prisma + Postgres for persistence.
- TanStack Query for client-side server-state caching.
- Base UI primitives, lucide-react icons.
- SCSS Modules and CSS custom properties for styling.

## First Checks

Before editing, inspect the existing code and preserve user changes. The worktree may be dirty.

Use these commands for orientation:

```bash
git status --short
find src -maxdepth 3 -type d | sort
rg "pattern" src
```

For Next.js-specific changes, read the relevant local docs in `node_modules/next/dist/docs/` first. Do not rely on older Next.js assumptions.

## Project Structure

`src/app` is the Next.js routing layer:

- Pages and layouts.
- API route handlers.
- Global app wiring such as root providers and the global CSS import.
- No reusable UI, domain models, or shared business logic should be implemented here.

App-wide providers live in `src/app/providers`. Keep `src/app/layout.tsx` as a thin root shell that defines `<html>`, `<body>`, imports global styles, and wraps children in providers.

FSD layers live under `src`:

- `pages-layer` contains full route-level page compositions imported by `src/app`.
- `widgets` compose features, entities, and shared UI into product blocks.
- `features` implement user actions and flows.
- `entities` own domain models, domain UI, hooks, and API clients.
- `shared` contains reusable UI primitives, utilities, constants, styles, and shared types.

Current app routes:

- `/`
- `/workspace`
- `/workspace/[slug]`
- `/workspace/[slug]/members`
- `/board/[id]`
- `/board/new`
- `/invite/[token]`
- `/api/auth/[...nextauth]`
- `/api/boards`
- `/api/boards/[id]`
- `/api/workspaces`
- `/api/workspaces/[slug]`
- `/api/workspaces/[slug]/boards`
- `/api/workspaces/[slug]/members`
- `/api/workspaces/[slug]/invites/[id]`
- `/api/invites/[token]/accept`
- `/api/liveblocks-auth`

Current page slices:

- `@pages/home`
- `@pages/workspace-overview`
- `@pages/workspace-members`
- `@pages/board-room`
- `@pages/invite-accept`

## Feature-Sliced Design Rules

Follow the dependency direction:

```text
app -> pages-layer -> widgets -> features -> entities -> shared
```

`shared` must not import from app, widgets, features, or entities.
`entities` may import only from shared.
`features` may import from entities and shared.
`widgets` may import from features, entities, and shared.
`pages-layer` may import from widgets, features, entities, and shared.
`app` may compose pages-layer and any lower layer.

Avoid new same-layer cross-slice dependencies. If an existing widget composes another widget, keep the import through that widget's public API and do not introduce cycles.

## Import Rules

Cross-slice imports must use subgroup public APIs:

```ts
import { BoardCard } from '@entities/board/ui';
import { getBoards } from '@entities/board/api';
import type { Board } from '@entities/board/model';
import { CreateBoardButton } from '@features/create-board/ui';
import { WorkspaceMembersPage } from '@pages/workspace-members';
import { BoardList } from '@widgets/board-list/ui';
import { Button } from '@shared/ui';
```

Do not use deep cross-slice imports:

```ts
// Wrong
import { BoardCard } from '@entities/board/ui/BoardCard/BoardCard';
import type { Board } from '@entities/board/model/types';
```

Inside the same slice, use relative imports only:

```ts
import type { Board } from '../../model';
import styles from './BoardCard.module.scss';
```

Do not import a slice from itself through an alias.

Subgroup public API files are named `index.ts` and live under groups such as:

- `ui`
- `api`
- `model`
- `hooks`
- `lib`
- `config`
- `consts`

Export only symbols needed outside the subgroup. Do not blindly export internals.

Root slice barrels may exist for legacy compatibility, but new cross-slice imports should prefer subgroup APIs.

## Slice Layout

Use this shape for entities, features, and widgets:

```text
slice-name/
  ui/
    ComponentName/
      ComponentName.tsx
      ComponentName.module.scss
    index.ts
  api/
    index.ts
  model/
    index.ts
  hooks/
    index.ts
  index.ts
```

Only create subgroups that the slice actually needs.
Do not place implementation `.ts` or `.tsx` files directly in a slice root.

Page slices under `src/pages-layer` use a flatter shape:

```text
page-name/
  PageName.tsx
  PageName.module.scss
  index.ts
```

## Styling

Use SCSS Modules for component and page styles.

Do not add Tailwind CSS, shadcn, utility-class styling, or `@apply`.

Global CSS is limited to:

- `src/shared/styles/global.css`
- `src/shared/styles/reset.css`
- `src/shared/styles/tokens.css`

Import global styles only from `src/app/layout.tsx`, and import only `@/shared/styles/global.css` there. `global.css` owns font imports and imports `tokens.css` and `reset.css`.

Component styles belong next to the component as `ComponentName.module.scss`.

Class names in JSX should come from CSS Modules, not utility strings.

Stylelint enforces the project CSS property order. Write new CSS/SCSS in this order:

```text
1. Positioning
2. Display and layout
3. Flex and grid
4. Box model
5. Sizing
6. Typography
7. Visuals
8. Interaction
9. Motion and transforms
10. Miscellaneous properties at the bottom, alphabetized by Stylelint
```

Run `npm run lint:styles:fix` after styling changes. VS Code is configured to apply Stylelint fixes on save through `.vscode/settings.json`; the recommended extension is listed in `.vscode/extensions.json`.

## Design Tokens

The source of truth is `src/shared/styles/tokens.css`.

Use tokens for system-level values:

- backgrounds and surfaces
- borders
- accent and danger colors
- text colors
- typography
- spacing
- radius
- elevation
- motion
- shell dimensions
- z-index layers

Do not add new tokens casually. Add a token only when the value is repeated across independent components or represents a stable product decision.

Current spacing scale:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

Typography tokens use `rem`:

```css
--text-caption: 0.6875rem;
--text-small: 0.75rem;
--text-control: 0.8125rem;
--text-body: 0.875rem;
--text-body-lg: 1rem;
--text-title: 1.125rem;
--text-display: 3rem;
```

Keep `line-height` unitless unless a component has a narrow, intentional alignment constraint.

Use local pixel values when the value is truly component-specific, such as avatar sizes, icon sizes, canvas geometry, or one-off layout constraints.

## Visual Direction

The UI should feel like a focused architecture tool:

- Neutral backgrounds, clear borders, restrained accent usage.
- Destructive actions use `--danger`, `--danger-hover`, and `--danger-soft`.
- Cards, dialogs, menus, and buttons use radius tokens; the largest standard radius is `--radius-lg` (`8px`).
- Avoid decorative gradients, color noise, and new one-off palettes.
- Text must fit on mobile and desktop without layout shift.

## Shared Layer

`@shared/ui` exports reusable primitives such as Button, Input, Dialog, DropdownMenu, and Logo.

`@shared/lib` exports utilities and server helpers. It currently contains both browser-safe utilities and server-only symbols:

- Browser-safe examples: `cn`, `formatRelativeTime`, plan constants.
- Server-only examples: `authOptions`, `prisma`, `getLiveblocks`.

Do not import server-only symbols into client components. If a client component needs a utility, ensure the imported symbol is browser-safe.

Liveblocks server access must stay lazy. Use `getLiveblocks()` in server route handlers after request validation. Do not instantiate `Liveblocks` at module import time.

## Data Model

Prisma schema lives in `prisma/schema.prisma`.

Primary models:

- `User`
- `Workspace`
- `WorkspaceMember`
- `Board`
- `BoardMember`
- NextAuth models: `Account`, `Session`, `VerificationToken`

Ownership rules:

- Boards belong to workspaces, not directly to users.
- Workspace owners and admins have implicit access to workspace boards.
- `BoardMember` is explicit per-board ACL for non-admin workspace members.
- Inviting a user to a board can require creating a `WorkspaceMember`.

Plan limits live in `src/shared/lib/constants.ts`. Do not use magic numbers for plan limits.

Current limits:

- Free: 1 workspace, 2 boards per workspace, 2 concurrent users per board.
- Pro: 5 workspaces, 10 boards per workspace, 10 concurrent users per board.

Enforcement points:

- Workspace creation: `POST /api/workspaces`.
- Board creation: `POST /api/workspaces/[slug]/boards` and legacy board routes where applicable.
- Realtime access and concurrent limit: `/api/liveblocks-auth`.

Workspace slugs are derived from workspace names and are not user-editable.

## API and Server Code

Route handlers live under `src/app/api`.

Use `authOptions` and `prisma` from `@shared/lib` in server code.

Validate access before returning or mutating data.

Return explicit HTTP status codes and JSON error payloads.

Never expose secrets or raw environment values in logs or responses.

Liveblocks secret keys must be server-side only and must start with `sk_`.

## Client Code

Use `"use client"` only when a component needs client behavior: hooks, local state, browser APIs, event handlers, tldraw, or Liveblocks client APIs.

Prefer server components for data loading and route composition.

For `next/image` with `fill`, always provide a `sizes` prop.

## TanStack Query

TanStack Query is the standard tool for client-side server state that needs caching, invalidation, optimistic updates, or shared loading state.

The root provider lives in `src/app/providers/QueryProvider.tsx` and is composed by `AppProviders`.

Follow FSD boundaries:

- Query keys live in the owning entity model subgroup, such as `src/entities/board/model/queryKeys.ts`.
- Query and mutation hooks live in the owning entity hooks subgroup, such as `src/entities/board/hooks`.
- Low-level fetch functions stay in the entity api subgroup.
- Widgets and page slices consume entity hooks; they should not own query keys or broad cache-update logic.

Use TanStack Query for product lists and mutation flows such as boards, workspaces, members, and invites.

Do not use TanStack Query for high-frequency canvas autosave writes. Keep `CanvasEditor` board `data` persistence as direct API calls unless there is a specific product requirement to change it.

For optimistic updates, keep server data authoritative:

- Use `onMutate` snapshots for rollback.
- Restore snapshots in `onError`.
- Invalidate or reconcile from mutation responses in `onSettled` or `onSuccess`.
- Prefer server timestamps over client-generated timestamps for persisted fields.

TanStack Query Devtools are development-only. The browser extension uses `window.__TANSTACK_QUERY_CLIENT__`, which should only be assigned in development.

## TypeScript Rules

- Strict TypeScript is enabled.
- Avoid `any`; use explicit types or narrow unknown values.
- Reusable modules use named exports.
- Next.js page, layout, route, and config files may follow framework-required default export conventions.
- Prefer `async`/`await`.
- Keep each file focused on one responsibility.

## Dependency Policy

Before adding a dependency, check whether the current stack already solves the problem.

Do not add Tailwind, shadcn, or another styling framework.

Use existing primitives first:

- Base UI for accessible primitives.
- lucide-react for icons.
- tldraw for canvas behavior.
- Liveblocks for realtime collaboration.
- Prisma for database access.

## Verification

Before claiming a task is complete, run the checks relevant to the change.

Default full verification:

```bash
npx tsc --noEmit --pretty false
npm run lint
npm run lint:styles
npm run build
```

For styling/token work, also run targeted static searches when relevant:

```bash
rg "old-token-or-forbidden-pattern" src CLAUDE.md AGENTS.md
git diff --check
```

For UI behavior or visual work, run the app and verify in a browser when practical.

## Communication

Keep responses concise and action-oriented.

- Do not write long explanations unless explicitly requested.
- Default final responses should be 3-7 short lines.
- Include only what changed, how it was verified, and any caveats or next step.
- Avoid background context, praise, repetition, and broad summaries.
- If detailed reasoning is needed, ask first or wait for an explicit request.

## Working Rules

- Preserve existing user changes.
- Do not revert unrelated dirty files.
- Keep changes scoped to the request.
- Do not rewrite business logic during styling or import refactors.
- Do not rename modules unless necessary.
- Prefer the existing architecture and naming over introducing new abstractions.
- If something is ambiguous, choose the conservative option and document the assumption.
