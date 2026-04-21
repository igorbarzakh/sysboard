import { TrackBoardVisit } from '@entities/board/ui'
import type { Board } from '@entities/board/model'
import { CanvasEditor } from '@widgets/canvas-editor/ui'

interface BoardRoomPageProps {
  board: Board
}

export function BoardRoomPage({ board }: BoardRoomPageProps) {
  return (
    <>
      <TrackBoardVisit
        id={board.id}
        name={board.name}
        workspaceSlug={board.workspace.slug}
      />
      <CanvasEditor board={board} />
    </>
  )
}
