import { NextResponse } from 'next/server'
import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/db'
import { liveblocks } from '@/shared/lib/liveblocks'
import { MAX_USERS_PER_BOARD } from '@/shared/lib/constants'

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth()
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

  const member = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId: roomId, userId: session.user.id } },
  })
  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: activeUsers } = await liveblocks.getActiveUsers(roomId)
  const isAlreadyConnected = activeUsers.some((u) => u.id === session.user.id)

  if (!isAlreadyConnected && activeUsers.length >= MAX_USERS_PER_BOARD) {
    return NextResponse.json(
      { error: `Room is full (max ${MAX_USERS_PER_BOARD} users)` },
      { status: 403 }
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
