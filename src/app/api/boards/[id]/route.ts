import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { BOARD_NAME_MAX_LENGTH } from '@entities/board/model'
import type { Board } from '@entities/board/model'
import { authOptions, prisma } from '@shared/lib/server'

type RouteContext = { params: Promise<{ id: string }> }

async function requireBoardAccess(boardId: string, userId: string) {
  return prisma.board.findFirst({
    where: {
      id: boardId,
      OR: [
        { workspace: { members: { some: { userId } } } },
        { members: { some: { userId } } },
      ],
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          ownerId: true,
          slug: true,
          members: { where: { userId }, select: { role: true } },
        },
      },
      members: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      views: {
        where: { userId },
        select: { lastViewedAt: true },
      },
      favorites: {
        where: { userId },
        select: { createdAt: true },
      },
    },
  })
}

function serializeBoard(board: Awaited<ReturnType<typeof requireBoardAccess>>): Board | null {
  if (!board) return null

  const { favorites, views, ...rest } = board

  return {
    ...rest,
    createdAt: rest.createdAt.toISOString(),
    updatedAt: rest.updatedAt.toISOString(),
    isFavorite: favorites.length > 0,
    lastViewedAt: views[0]?.lastViewedAt.toISOString() ?? null,
    members: rest.members.map((member) => ({
      ...member,
      joinedAt: member.joinedAt.toISOString(),
      role: 'editor',
    })),
  }
}

export async function GET(_request: Request, { params }: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const board = await requireBoardAccess(id, session.user.id)
  if (!board) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(serializeBoard(board))
}

export async function PATCH(request: Request, { params }: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const board = await requireBoardAccess(id, session.user.id)
  if (!board) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body: unknown = await request.json()
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const updateData: { name?: string; data?: object; updatedAt?: Date } = {}

  if ('name' in payload) {
    if (
      board.createdById !== session.user.id &&
      board.workspace.ownerId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Only the board creator or workspace owner can rename this board' },
        { status: 403 },
      )
    }

    if (typeof payload.name !== 'string' || !payload.name.trim()) {
      return NextResponse.json({ error: 'Name must be a non-empty string' }, { status: 400 })
    }
    if (payload.name.trim().length > BOARD_NAME_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Name must be ${BOARD_NAME_MAX_LENGTH} characters or fewer` },
        { status: 400 },
      )
    }
    updateData.name = payload.name.trim()
  }

  if ('data' in payload) {
    if (typeof payload.data !== 'object' || payload.data === null) {
      return NextResponse.json({ error: 'Data must be an object' }, { status: 400 })
    }
    updateData.data = payload.data as object
  }

  if ('name' in payload && !('data' in payload)) {
    updateData.updatedAt = board.updatedAt
  }

  const updated = await prisma.board.update({ where: { id }, data: updateData })
  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const board = await requireBoardAccess(id, session.user.id)

  if (!board) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (
    board.createdById !== session.user.id &&
    board.workspace.ownerId !== session.user.id
  ) {
    return NextResponse.json(
      { error: 'Only the board creator or workspace owner can delete this board' },
      { status: 403 },
    )
  }

  await prisma.board.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
