# Neon Avatar Storage

**Status:** Completed on 2026-09-17. Runtime storage and all referenced user/workspace images use Neon Object Storage.

**Architecture:** Avatar routes keep their existing contracts. `src/shared/lib/avatarStorage.ts` uses the AWS S3 SDK with a lazy client and path-style addressing. The public `avatars` bucket stores user images under `users/{userId}/` and workspace images under `workspaces/{workspaceId}/`. No database schema changes are required.

**Tech Stack:** Next.js 16, AWS SDK v3, Prisma.

The application uploads, lists, and deletes objects with `@aws-sdk/client-s3`. `next.config.ts` permits images only from the configured Neon endpoint and bucket. Storage credentials remain server-side.

## Configuration

Set these server-only environment variables:

- `AWS_ENDPOINT_URL_S3`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`

The bucket must use `public_read`; writes and deletes require the server credentials. Configure the same variables in every deployment environment.

## Verification

- TypeScript: `npx tsc --noEmit --pretty false`
- ESLint: `npm run lint`
- Stylelint: `npm run lint:styles`
- Production build: `npm run build`

References: https://neon.com/docs/storage/get-started and https://neon.com/docs/storage/buckets.
