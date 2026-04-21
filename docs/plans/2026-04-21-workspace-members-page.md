# Workspace Members Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `/workspace/[slug]/members` so workspace members can view the member list, while only the owner can invite or remove members.

**Architecture:** Use a server page to load the workspace and current user's role from Prisma, then pass serializable data into a widget client component for invite/remove interactions. Keep member permissions enforced in route handlers, not only UI. Preserve the simplified role model in UI: owner and member only.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma, NextAuth, SCSS Modules, existing shared UI primitives.

---

### Task 1: Enforce owner-only member management API

**Files:**
- Modify: `src/app/api/workspaces/[slug]/members/route.ts`

Steps:
- Change POST permission check from owner/admin to owner only.
- Change DELETE permission check from owner/admin to owner only.
- Keep owner removal blocked.

### Task 2: Add members page data route

**Files:**
- Create: `src/app/workspace/[slug]/members/page.tsx`
- Create: `src/app/workspace/[slug]/members/page.module.scss`

Steps:
- Authenticate with `getServerSession`.
- Await Next.js 16 async params.
- Load workspace by slug and membership.
- Redirect away if unauthorized.
- Serialize members and compute `canManageMembers` from caller role === owner.

### Task 3: Add workspace members widget

**Files:**
- Create: `src/widgets/workspace-members/ui/WorkspaceMembersPage/WorkspaceMembersPage.tsx`
- Create: `src/widgets/workspace-members/ui/WorkspaceMembersPage/WorkspaceMembersPage.module.scss`
- Create: `src/widgets/workspace-members/ui/index.ts`
- Create: `src/widgets/workspace-members/index.ts`

Steps:
- Render page header, invite form for owner, read-only hint for members.
- Render member list with avatar/name/email/role/joined date.
- Owner can remove non-owner members.
- Invite and remove via existing `/api/workspaces/[slug]/members`.

### Task 4: Verify

Run:
- `node_modules/.bin/tsc --noEmit --pretty false`
- `npm run lint`
- `npm run lint:styles`
- `npm run build`
