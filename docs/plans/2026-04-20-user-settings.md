# User Settings Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a compact account settings modal for avatar upload, display name, optional profile role label, and full account deletion.

**Architecture:** Add a nullable `profileRole` field to `User`, expose profile update and account deletion through authenticated route handlers, and reuse the existing avatar upload endpoint. Compose the UI as a feature slice opened from the existing `UserMenu` settings item.

**Tech Stack:** Next.js App Router route handlers, React client components, NextAuth session updates, Prisma, Supabase Storage REST helpers, SCSS Modules, shared UI primitives.

---

### Task 1: Profile Role Model

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/entities/user/model/types.ts`
- Modify: `src/shared/types/index.ts`
- Modify: `src/shared/lib/auth.ts`
- Create: `src/entities/user/model/profileRoles.ts`

**Steps:**
1. Add `profileRole String?` to the Prisma `User` model.
2. Add browser-safe role constants and a type derived from the constants.
3. Extend user/session types with optional `profileRole`.
4. Copy `profileRole` into JWT/session callbacks without using it for access checks.
5. Run `npx prisma generate` if generated Prisma types are stale.

### Task 2: Profile API

**Files:**
- Create: `src/app/api/users/me/route.ts`
- Modify: `src/shared/lib/avatarStorage.ts`

**Steps:**
1. Read the local Next.js route handler docs before editing the route.
2. Add `PATCH` for authenticated profile updates.
3. Validate `name` as nullable/trimmed string and `profileRole` as nullable whitelisted value.
4. Add `DELETE` for authenticated account deletion.
5. Add a Supabase helper that removes all avatar objects under `users/{userId}/`.
6. Delete avatar objects and then delete the Prisma `User`; rely on existing cascade rules for related records.

### Task 3: Settings Modal UI

**Files:**
- Create: `src/features/user-settings-modal/ui/UserSettingsModal/UserSettingsModal.tsx`
- Create: `src/features/user-settings-modal/ui/UserSettingsModal/UserSettingsModal.module.scss`
- Create: `src/features/user-settings-modal/ui/index.ts`
- Create: `src/features/user-settings-modal/index.ts`
- Modify: `src/widgets/app-header/ui/UserMenu/UserMenu.tsx`

**Steps:**
1. Build a client modal using shared `Dialog`, `Input`, `Select`, `Button`, and `Avatar`.
2. Initialize form values from the current session user.
3. Upload avatar through `/api/users/avatar` and call `session.update`.
4. Save name and role through `/api/users/me` and call `session.update`.
5. Add a separate confirmation dialog for account deletion.
6. After successful deletion, call NextAuth `signOut` with a root callback URL.
7. Open this modal from the existing `Settings` dropdown item only.

### Task 4: Verification

**Files:**
- Check changed files only.

**Steps:**
1. Run `npx tsc --noEmit --pretty false`.
2. Run `npm run lint`.
3. Run `npm run lint:styles`.
4. Run `npm run build`.
5. If practical, start the dev server and verify the settings flow in a browser.
