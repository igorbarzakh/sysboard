import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, prisma } from '@shared/lib/server'

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(
  request: Request,
  { params }: RouteContext,
): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const board = await prisma.board.findFirst({
    where: {
      id,
      OR: [
        { workspace: { members: { some: { userId: session.user.id } } } },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    select: { id: true },
  })

  if (!board) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body: unknown = await request.json()
  if (
    typeof body !== 'object' ||
    body === null ||
    !('isFavorite' in body) ||
    typeof (body as Record<string, unknown>).isFavorite !== 'boolean'
  ) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const isFavorite = (body as Record<string, unknown>).isFavorite as boolean

  if (isFavorite) {
    await prisma.boardFavorite.upsert({
      where: { boardId_userId: { boardId: id, userId: session.user.id } },
      create: { boardId: id, userId: session.user.id },
      update: {},
    })
  } else {
    await prisma.boardFavorite.deleteMany({
      where: { boardId: id, userId: session.user.id },
    })
  }

  return NextResponse.json({ isFavorite })
}
