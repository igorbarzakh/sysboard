# Board Creator Permissions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent users from renaming or deleting boards they did not create.

**Architecture:** Add a required `Board.createdById` relation, backfill existing rows from the first board member or workspace owner, and enforce creator-only checks in board rename/delete APIs. Board canvas data updates remain available to workspace members.

**Tech Stack:** Next.js App Router route handlers, Prisma, Postgres, TypeScript, SCSS Modules.

---

### Task 1: Persist Board Creator

Add `createdById` and `createdBy` to `Board`, with a migration that backfills existing boards.

### Task 2: Fill Creator on Board Creation

Set `createdById: session.user.id` in every board creation path.

### Task 3: Enforce Rename/Delete Permissions

In `PATCH /api/boards/[id]`, reject `name` changes when `createdById !== session.user.id`. In `DELETE /api/boards/[id]`, reject non-creators. Keep `data` patches unchanged.

### Task 4: Hide UI Actions for Non-Creators

Expose `createdById` in the board type and hide rename/delete menu items for boards where the current user is not the creator.

### Task 5: Verify

Run Prisma generate, apply migration, TypeScript, ESLint, Stylelint, and build.
