/**
 * Post-Phase-3 backfill: Board.ownerId no longer exists.
 *
 * Step 1 — Workspaces missing their owner membership:
 *   Find every Workspace with no WorkspaceMember rows and create a
 *   WorkspaceMember(role=owner) using workspace.ownerId.
 *
 * Step 2 — Users with no workspace at all:
 *   Find every User who has no WorkspaceMember row (not a member of any
 *   workspace), then create a default Workspace + WorkspaceMember(owner).
 *
 * Idempotent: safe to run multiple times.
 */

import { PrismaClient } from '@prisma/client'
import { customAlphabet } from 'nanoid'

const prisma = new PrismaClient()
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6)

function deriveSlug(name: string, suffix: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return `${base}-${suffix}`
}

async function fixOrphanedWorkspaces(): Promise<number> {
  // Workspaces that exist but have no members at all.
  const orphaned = await prisma.workspace.findMany({
    where: { members: { none: {} } },
    select: { id: true, name: true, slug: true, ownerId: true },
  })

  if (orphaned.length === 0) {
    console.log('Step 1: No orphaned workspaces found.')
    return 0
  }

  console.log(`Step 1: Found ${orphaned.length} workspace(s) with no members.`)

  let created = 0
  for (const ws of orphaned) {
    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: ws.id, userId: ws.ownerId } },
      create: { workspaceId: ws.id, userId: ws.ownerId, role: 'owner' },
      update: {},
    })
    console.log(`  Created WorkspaceMember(owner) for workspace "${ws.name}" (${ws.slug}), userId=${ws.ownerId}`)
    created++
  }

  return created
}

async function createWorkspacesForMemberlessUsers(): Promise<number> {
  // Users who are not a member of any workspace.
  const users = await prisma.user.findMany({
    where: { workspaceMembers: { none: {} } },
    select: { id: true, email: true, name: true },
  })

  if (users.length === 0) {
    console.log('Step 2: All users already have at least one workspace.')
    return 0
  }

  console.log(`Step 2: Found ${users.length} user(s) with no workspace.`)

  let created = 0
  for (const user of users) {
    const workspaceName = `${user.name || user.email}'s Workspace`
    const slug = deriveSlug(workspaceName, nanoid())

    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug,
        ownerId: user.id,
        members: {
          create: { userId: user.id, role: 'owner' },
        },
      },
    })

    console.log(`  Created workspace "${workspace.name}" (${workspace.slug}) for ${user.email}`)
    created++
  }

  return created
}

async function main(): Promise<void> {
  const step1Count = await fixOrphanedWorkspaces()
  const step2Count = await createWorkspacesForMemberlessUsers()

  const total = step1Count + step2Count
  if (total === 0) {
    console.log('Backfill already complete — nothing to do.')
  } else {
    console.log(`Backfill complete. Created ${step1Count} owner membership(s), ${step2Count} workspace(s).`)
  }
}

main()
  .catch((err: unknown) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
