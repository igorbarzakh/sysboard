# User Settings Modal Design

## Goal

Add a compact user settings modal where an authenticated user can update their avatar, display name, optional profile role label, and delete their account.

## Scope

- The role is a profile label only. It does not affect permissions, billing, workspace access, board access, limits, or Liveblocks behavior.
- The role may be empty and should be stored as `null`.
- The existing `Settings` item in the user menu opens the modal. No new menu item is added.
- Avatar upload uses the existing Supabase `avatars` bucket flow.

## Architecture

- Add `User.profileRole String?` to Prisma.
- Store role options in browser-safe code and validate incoming updates against the same whitelist.
- Add `PATCH /api/users/me` for profile updates.
- Add `DELETE /api/users/me` for account deletion.
- Reuse `POST /api/users/avatar` for avatar upload.
- Keep account deletion destructive and explicit: the main settings dialog opens a separate confirmation dialog.

## UI

- Use the shared `Dialog`, `Input`, `Select`, `Button`, and `Avatar` primitives.
- The modal contains avatar controls, name input, role select, and a save footer.
- A visually separated danger area contains `Delete account`.
- The layout should stay neutral and compact: no decorative elements, no nested cards, no extra navigation.

## Data Flow

1. `UserMenu` owns modal open state.
2. `UserSettingsModal` receives the current session user data.
3. Avatar upload posts a multipart file to `/api/users/avatar`, then updates the NextAuth session image.
4. Profile save patches `/api/users/me`, then updates the NextAuth session with `name`, `image`, and `profileRole`.
5. Account deletion deletes Supabase avatar objects under the user prefix, deletes the user record, and the client signs out.

## Errors

- Unauthenticated API calls return `401`.
- Invalid role values return `400`.
- Empty role values are normalized to `null`.
- Avatar upload errors are shown inside the modal without closing it.
- Delete failures keep the user signed in and show an error.

## Verification

- Run TypeScript, ESLint, Stylelint, and production build.
- Check that settings opens from the existing menu item.
- Check that name, role, avatar, and account deletion flows have clear loading and error states.
