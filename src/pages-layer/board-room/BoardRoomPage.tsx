import { BoardVisitTracker } from '@entities/board/ui'
import type { Board } from '@entities/board/model'
import { CanvasEditor } from '@widgets/canvas-editor/ui'

interface BoardRoomPageProps {
  board: Board
  currentUserId: string
}

export function BoardRoomPage({ board, currentUserId }: BoardRoomPageProps) {
  return (
    <>
      <BoardVisitTracker
        boardId={board.id}
        currentUserId={currentUserId}
        workspaceSlug={board.workspace.slug}
      />
      <CanvasEditor board={board} />
    </>
  )
}
