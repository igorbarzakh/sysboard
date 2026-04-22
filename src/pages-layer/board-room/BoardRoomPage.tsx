import { BoardVisitTracker } from '@entities/board/ui'
import type { Board } from '@entities/board/model'
import { CanvasEditor } from '@widgets/canvas-editor/ui'

interface BoardRoomPageProps {
  board: Board
}

export function BoardRoomPage({ board }: BoardRoomPageProps) {
  return (
    <>
      <BoardVisitTracker boardId={board.id} />
      <CanvasEditor board={board} />
    </>
  )
}
