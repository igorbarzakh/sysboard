import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/db'
import { CanvasEditor } from '@/widgets/canvas-editor'
import type { Board } from '@/entities/board'

type PageProps = { params: Promise<{ id: string }> }

export default async function BoardPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  const { id } = await params

  const row = await prisma.board.findFirst({
    where: {
      id,
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      owner: { select: { id: true, name: true, image: true } },
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
    members: row.members.map((m) => ({
      userId: m.userId,
      role: m.role as 'owner' | 'editor',
      joinedAt: m.joinedAt.toISOString(),
      user: m.user,
    })),
  }

  return <CanvasEditor board={board} />
}
