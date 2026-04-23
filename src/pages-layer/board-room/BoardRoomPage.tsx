'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useBoardQuery } from '@entities/board/hooks'
import { BoardVisitTracker } from '@entities/board/ui'
import { CanvasEditor } from '@widgets/canvas-editor/ui'

interface BoardRoomPageProps {
  boardId: string
  currentUserId: string
}

export function BoardRoomPage({ boardId, currentUserId }: BoardRoomPageProps) {
  const router = useRouter()
  const { data: board, error, isPending } = useBoardQuery({ boardId, currentUserId })

  useEffect(() => {
    if (error) {
      router.replace('/')
    }
  }, [error, router])

  if (!board || isPending) {
    return null
  }

  return (
    <>
      <BoardVisitTracker
        board={board}
        currentUserId={currentUserId}
        workspaceSlug={board.workspace.slug}
      />
      <CanvasEditor board={board} />
    </>
  )
}
