import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PLAN_LIMITS } from '@shared/lib'
import { authOptions, getLiveblocks, prisma } from '@shared/lib/server'
import type { UserPlan } from '@shared/lib'

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await request.json()
  if (
    typeof body !== 'object' ||
    body === null ||
    !('room' in body) ||
    typeof (body as Record<string, unknown>).room !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const roomId = (body as Record<string, unknown>).room as string

  const board = await prisma.board.findFirst({
    where: {
      id: roomId,
      OR: [
        { workspace: { members: { some: { userId: session.user.id } } } },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    select: {
      workspace: { select: { owner: { select: { plan: true } } } },
    },
  })

  if (!board) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const liveblocks = getLiveblocks()
  const limit = PLAN_LIMITS[board.workspace.owner.plan as UserPlan].maxMembersPerBoard
  const { data: activeUsers } = await liveblocks.getActiveUsers(roomId)
  const isAlreadyConnected = activeUsers.some((u) => u.id === session.user.id)

  if (!isAlreadyConnected && activeUsers.length >= limit) {
    return NextResponse.json(
      { error: `Room is full (max ${limit} users)` },
      { status: 403 },
    )
  }

  const liveblocksSession = liveblocks.prepareSession(session.user.id, {
    userInfo: {
      name: session.user.name ?? session.user.email ?? 'Anonymous',
      image: session.user.image ?? null,
    },
  })

  liveblocksSession.allow(roomId, liveblocksSession.FULL_ACCESS)

  const { body: token, status } = await liveblocksSession.authorize()
  return new NextResponse(token, { status })
}
