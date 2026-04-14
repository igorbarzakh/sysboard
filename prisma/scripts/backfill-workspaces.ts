/**
 * Phase 2 backfill: migrate boards from direct User ownership to Workspace ownership.
 *
 * This script is designed to run AFTER Phase 1 migration (workspaceId nullable)
 * and BEFORE Phase 3 migration (workspaceId NOT NULL). Once Phase 3 has been
 * applied, running this script is a safe no-op — it will find no unmigrated boards.
 */

import { PrismaClient, Prisma } from '@prisma/client'
import { customAlphabet } from 'nanoid'

const prisma = new PrismaClient()
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6)

function deriveSlug(email: string, suffix: string): string {
  const localPart = email.split('@')[0]
  const base = localPart
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return `${base}-${suffix}`
}

interface UnmigratedBoard {
  id: string
  owner_id: string
}

interface BoardMemberRow {
  user_id: string
}

async function main(): Promise<void> {
  // Raw SQL: workspaceId IS NULL is only possible pre-Phase 3.
  // Post-Phase 3, this returns empty and the script exits early.
  const unmigratedBoards = await prisma.$queryRaw<UnmigratedBoard[]>(
    Prisma.sql`SELECT id, "ownerId" AS owner_id FROM "Board" WHERE "workspaceId" IS NULL`,
  )

  if (unmigratedBoards.length === 0) {
    console.log('No unmigrated boards found. Backfill is already complete.')
    return
  }

  const boardsByOwner = new Map<string, string[]>()
  for (const board of unmigratedBoards) {
    const list = boardsByOwner.get(board.owner_id) ?? []
    list.push(board.id)
    boardsByOwner.set(board.owner_id, list)
  }

  console.log(
    `Found ${unmigratedBoards.length} unmigrated board(s) across ${boardsByOwner.size} user(s).`,
  )

  for (const [ownerId, boardIds] of boardsByOwner) {
    const user = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      console.warn(`  User ${ownerId} not found — skipping ${boardIds.length} board(s).`)
      continue
    }

    const workspaceName = `${user.name ?? 'My'} Workspace`
    const slug = deriveSlug(user.email, nanoid())

    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug,
        ownerId: user.id,
        plan: 'free',
        members: {
          create: { userId: user.id, role: 'owner' },
        },
      },
    })

    console.log(`  Created workspace "${workspace.name}" (${workspace.slug}) for ${user.email}`)

    const memberRows = await prisma.$queryRaw<BoardMemberRow[]>(
      Prisma.sql`SELECT DISTINCT "userId" AS user_id FROM "BoardMember" WHERE "boardId" = ANY(${boardIds}::text[]) AND "userId" != ${user.id}`,
    )

    for (const row of memberRows) {
      await prisma.workspaceMember.upsert({
        where: { workspaceId_userId: { workspaceId: workspace.id, userId: row.user_id } },
        create: { workspaceId: workspace.id, userId: row.user_id, role: 'member' },
        update: {},
      })
    }

    await prisma.$executeRaw(
      Prisma.sql`UPDATE "Board" SET "workspaceId" = ${workspace.id} WHERE id = ANY(${boardIds}::text[])`,
    )

    console.log(
      `  Migrated ${boardIds.length} board(s), ${memberRows.length} workspace member(s) added.`,
    )
  }

  console.log('Backfill complete.')
}

main()
  .catch((err: unknown) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
