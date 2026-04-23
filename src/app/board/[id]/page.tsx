import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/server'
import { BoardRoomPage } from '@pages/board-room'

type PageProps = { params: Promise<{ id: string }> }

export const metadata: Metadata = {
  title: 'Board',
}

export default async function BoardPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  const { id } = await params

  return <BoardRoomPage boardId={id} currentUserId={session.user.id} />
}
