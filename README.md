# Sysboard

Sysboard is a workspace for creating and organizing system-design boards. The canvas uses tldraw; board data is stored in PostgreSQL, and board previews and avatars are stored in S3-compatible object storage.

## Current features

- Sign in with Google or Discord.
- Create and switch workspaces; edit workspace details and avatars.
- Create, rename, delete, favorite, filter, and sort boards.
- Edit boards on a tldraw canvas with automatic database saves and generated previews.
- Edit boards together in real time with Liveblocks and see collaborators' cursors.
- View workspace members and, on the Pro plan, create one-time invitation links that expire after 24 hours.
- Edit your profile and avatar, or delete your account.
- Enforce workspace, board, and member limits according to the owner's plan.

## Local setup

You need Node.js and npm, a PostgreSQL database, OAuth applications for Google and Discord, and S3-compatible object storage for avatars and board previews.

1. Install dependencies and create a local environment file:

   ```bash
   npm ci
   cp .env.example .env
   ```

2. Fill in `.env` (used by both Prisma CLI and Next.js):

   | Variable | Purpose |
   | --- | --- |
   | `DATABASE_URL` | PostgreSQL connection used by the application. |
   | `DIRECT_URL` | Direct PostgreSQL connection used by Prisma migrations. |
   | `NEXTAUTH_URL` | Application URL, such as `http://localhost:3000`. |
   | `NEXTAUTH_SECRET` | Secret for NextAuth sessions and tokens. |
   | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth credentials. |
   | `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Discord OAuth credentials. |
   | `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | S3-compatible storage endpoint and credentials. |
   | `AWS_S3_BUCKET` | Storage bucket; defaults to `avatars`. |
   | `LIVEBLOCKS_SECRET_KEY` | Used to authorize real-time board collaboration. |

   Configure the OAuth applications to redirect to `http://localhost:3000/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/discord` for local development. Replace the host with your application URL in other environments.

3. Apply the database migrations and start the application:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run dev
   ```

4. Open `http://localhost:3000` and sign in. The first sign-in creates a workspace for the user.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Build the production application. |
| `npm run start` | Start a production build. |
| `npm run lint` | Run ESLint. |
| `npm run lint:styles` | Run Stylelint. |
| `npx tsc --noEmit --pretty false` | Check TypeScript types. |

## Current limitations

- The **Manage plan** button displays in workspace settings but has no billing or upgrade flow behind it. New users start on Free; creating member invitation links requires Pro.
- Workspace members can currently access every board in their workspace. Per-board member access controls and board sharing UI are not implemented.
- Automated tests and CI are not configured.

The application is built with Next.js 16, React 19, TypeScript, Prisma, TanStack Query, tldraw, and SCSS Modules. The Prisma schema is in `prisma/schema.prisma`; route handlers are in `src/app/api`.
