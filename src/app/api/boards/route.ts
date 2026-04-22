import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PLAN_LIMITS } from '@shared/lib'
import { authOptions, prisma } from '@shared/lib/server'
import type { UserPlan } from '@shared/lib'

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const boards = await prisma.board.findMany({
    where: {
      OR: [
        { workspace: { members: { some: { userId: session.user.id } } } },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      workspace: { select: { id: true, name: true, slug: true } },
      views: {
        where: { userId: session.user.id },
        select: { lastViewedAt: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(
    boards.map(({ views, ...board }) => ({
      ...board,
      lastViewedAt: views[0]?.lastViewedAt.toISOString() ?? null,
    })),
  )
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await request.json()
  if (
    typeof body !== 'object' ||
    body === null ||
    !('name' in body) ||
    typeof (body as Record<string, unknown>).name !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const name = ((body as Record<string, unknown>).name as string).trim()
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (name.length > 100) {
    return NextResponse.json({ error: 'Name must be 100 characters or fewer' }, { status: 400 })
  }

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true },
  })

  if (!workspace) {
    return NextResponse.json(
      { error: 'No workspace found. Create a workspace first.' },
      { status: 400 },
    )
  }

  const limit = PLAN_LIMITS[(session.user.plan ?? 'free') as UserPlan].maxBoardsPerWorkspace
  const boardCount = await prisma.board.count({ where: { workspaceId: workspace.id } })

  if (boardCount >= limit) {
    return NextResponse.json(
      { error: `Workspace board limit reached (max ${limit})` },
      { status: 403 },
    )
  }

  const board = await prisma.board.create({
    data: {
      name,
      workspaceId: workspace.id,
      createdById: session.user.id,
      members: {
        create: { userId: session.user.id, role: 'editor' },
      },
    },
    include: {
      workspace: { select: { id: true, name: true, slug: true } },
    },
  })

  return NextResponse.json(board, { status: 201 })
}
