import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type { Board } from '@entities/board/model'
import { PLAN_LIMITS } from '@shared/lib'
import { authOptions, prisma } from '@shared/lib/server'
import type { UserPlan } from '@shared/lib'

type RouteContext = { params: Promise<{ slug: string }> }

async function requireWorkspaceMember(slug: string, userId: string) {
  return prisma.workspace.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      ownerId: true,
      slug: true,
      owner: { select: { plan: true } },
      members: { where: { userId }, select: { role: true } },
      _count: { select: { boards: true } },
    },
  })
}

function serializeBoard(
  board: {
    id: string
    name: string
    workspaceId: string
    createdById: string
    data: unknown
    createdAt: Date
    updatedAt: Date
  },
  workspace: { id: string; name: string; ownerId: string; slug: string },
): Board {
  return {
    ...board,
    createdAt: board.createdAt.toISOString(),
    updatedAt: board.updatedAt.toISOString(),
    isFavorite: false,
    lastViewedAt: null,
    members: [],
    workspace,
  }
}

export async function GET(_request: Request, { params }: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  const workspace = await requireWorkspaceMember(slug, session.user.id)
  if (!workspace) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const boards = await prisma.board.findMany({
    where: { workspaceId: workspace.id },
    include: {
      workspace: { select: { id: true, name: true, ownerId: true, slug: true } },
      members: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
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

export async function POST(request: Request, { params }: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  const workspace = await requireWorkspaceMember(slug, session.user.id)
  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
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

  const plan = workspace.owner.plan as UserPlan
  const limit = PLAN_LIMITS[plan].maxBoardsPerWorkspace

  const boardCount = workspace._count.boards

  if (boardCount >= limit) {
    return NextResponse.json(
      { error: `Board limit reached (max ${limit} on ${plan} plan)` },
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
    select: {
      id: true,
      name: true,
      workspaceId: true,
      createdById: true,
      data: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json(
    serializeBoard(board, {
      id: workspace.id,
      name: workspace.name,
      ownerId: workspace.ownerId,
      slug: workspace.slug,
    }),
    { status: 201 },
  )
}
