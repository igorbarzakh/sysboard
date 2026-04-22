import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions, prisma } from '@shared/lib/server'
import type { Board } from '@entities/board/model'
import { BoardRoomPage } from '@pages/board-room'

type PageProps = { params: Promise<{ id: string }> }

export const metadata: Metadata = {
  title: 'Board',
}

export default async function BoardPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  const { id } = await params

  const row = await prisma.board.findFirst({
    where: {
      id,
      OR: [
        { workspace: { members: { some: { userId: session.user.id } } } },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      workspace: { select: { id: true, name: true, ownerId: true, slug: true } },
      members: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  })

  if (!row) redirect('/')

  const board: Board = {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    lastViewedAt: null,
    members: row.members.map((m) => ({
      userId: m.userId,
      role: m.role as 'editor',
      joinedAt: m.joinedAt.toISOString(),
      user: m.user,
    })),
  }

  return <BoardRoomPage board={board} currentUserId={session.user.id} />
}
