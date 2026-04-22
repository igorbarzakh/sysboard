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
      workspace: { select: { id: true, name: true, ownerId: true, slug: true } },
      views: {
        where: { userId: session.user.id },
        select: { lastViewedAt: true },
      },
      favorites: {
        where: { userId: session.user.id },
        select: { createdAt: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(
    boards.map(({ favorites, views, ...board }) => ({
      ...board,
      isFavorite: favorites.length > 0,
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
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  if (!('name' in payload) || typeof payload.name !== 'string') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const name = payload.name.trim()
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (name.length > 100) {
    return NextResponse.json({ error: 'Name must be 100 characters or fewer' }, { status: 400 })
  }

  const workspaceSlug =
    typeof payload.workspaceSlug === 'string' ? payload.workspaceSlug : null

  const workspace = await prisma.workspace.findFirst({
    where: {
      ...(workspaceSlug ? { slug: workspaceSlug } : {}),
      members: { some: { userId: session.user.id } },
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      owner: { select: { plan: true } },
    },
  })

  if (!workspace) {
    return NextResponse.json(
      { error: 'No workspace found. Create a workspace first.' },
      { status: 400 },
    )
  }

  const plan = workspace.owner.plan as UserPlan
  const limit = PLAN_LIMITS[plan].maxBoardsPerWorkspace
  const boardCount = await prisma.board.count({ where: { workspaceId: workspace.id } })

  if (boardCount >= limit) {
    return NextResponse.json(
      { error: `Workspace board limit reached (max ${limit} on ${plan} plan)` },
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
      workspace: { select: { id: true, name: true, ownerId: true, slug: true } },
      favorites: {
        where: { userId: session.user.id },
        select: { createdAt: true },
      },
    },
  })

  const { favorites, ...responseBoard } = board
  return NextResponse.json(
    { ...responseBoard, isFavorite: favorites.length > 0 },
    { status: 201 },
  )
}
