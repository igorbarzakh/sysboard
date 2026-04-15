import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions, prisma } from '@shared/lib'
import { CanvasEditor } from '@widgets/canvas-editor/ui'
import { TrackBoardVisit } from '@entities/board/ui'
import type { Board } from '@entities/board/model'

type PageProps = { params: Promise<{ id: string }> }

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
      workspace: { select: { id: true, name: true, slug: true } },
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
      role: m.role as 'editor',
      joinedAt: m.joinedAt.toISOString(),
      user: m.user,
    })),
  }

  return (
    <>
      <TrackBoardVisit id={board.id} name={board.name} workspaceSlug={board.workspace.slug} />
      <CanvasEditor board={board} />
    </>
  )
}
