import type { Board } from '@entities/board/model'
import { CanvasEditor } from '@widgets/canvas-editor/ui'

interface BoardRoomPageProps {
  board: Board
}

export function BoardRoomPage({ board }: BoardRoomPageProps) {
  return <CanvasEditor board={board} />
}
