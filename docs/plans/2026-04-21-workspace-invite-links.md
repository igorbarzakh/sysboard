# Workspace Invite Links Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace direct workspace member addition with copyable invite links.

**Architecture:** Workspace owners create pending `WorkspaceInvite` records from the members page. Invite recipients open `/invite/[token]`, sign in with the invited email, and accept access into the workspace as regular members.

**Tech Stack:** Next.js App Router, React client components, NextAuth, Prisma, Postgres, SCSS Modules.

---

### Task 1: Persist Workspace Invites

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260421120000_workspace_invites/migration.sql`

Add `WorkspaceInvite` with `email`, unique `token`, `workspaceId`, `invitedById`, `role`, `expiresAt`, `acceptedAt`, and timestamps.

### Task 2: Create Invite Links

**Files:**
- Modify: `src/app/api/workspaces/[slug]/members/route.ts`
- Modify: `src/widgets/workspace-members/ui/WorkspaceMembersPage/WorkspaceMembersPage.tsx`
- Modify: `src/widgets/workspace-members/ui/WorkspaceMembersPage/WorkspaceMembersPage.module.scss`

Change owner-only POST from direct member creation to pending invite creation. Return a copyable invite URL and show it in the members page after submit.

### Task 3: Accept Invite Links

**Files:**
- Create: `src/app/api/invites/[token]/accept/route.ts`
- Create: `src/app/invite/[token]/page.tsx`
- Create: `src/app/invite/[token]/page.module.scss`
- Create: `src/features/accept-workspace-invite/ui/AcceptWorkspaceInvitePage/AcceptWorkspaceInvitePage.tsx`
- Create: `src/features/accept-workspace-invite/ui/AcceptWorkspaceInvitePage/AcceptWorkspaceInvitePage.module.scss`
- Create: `src/features/accept-workspace-invite/ui/index.ts`
- Create: `src/features/accept-workspace-invite/index.ts`

Validate token, expiry, accepted state, and signed-in email. On accept, create `WorkspaceMember`, add board ACLs, mark invite accepted, and redirect to the workspace.

### Task 4: Verify

Run:
- `npx prisma generate`
- `npx tsc --noEmit --pretty false`
- `npm run lint`
- `npm run lint:styles`
- `npm run build`
