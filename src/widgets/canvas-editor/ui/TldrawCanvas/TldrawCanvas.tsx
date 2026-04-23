'use client'

import { useCallback, useRef } from 'react'
import { Tldraw, type Editor, type TLStoreSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import { updateBoard } from '@entities/board/api'
import type { Board } from '@entities/board/model'
import { BoardNamePanel } from '../BoardNamePanel/BoardNamePanel'

interface TldrawCanvasProps {
  board: Board
}

export function TldrawCanvas({ board }: TldrawCanvasProps) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMount = useCallback(
    (editor: Editor) => {
      if (board.data && typeof board.data === 'object') {
        try {
          editor.loadSnapshot(board.data as TLStoreSnapshot)
        } catch {
        }
      }

      editor.store.listen(
        () => {
          if (saveTimer.current) clearTimeout(saveTimer.current)
          saveTimer.current = setTimeout(() => {
            const snapshot = editor.getSnapshot()
            updateBoard(board.id, { data: snapshot }).catch(() => {})
          }, 1000)
        },
        { scope: 'document', source: 'user' },
      )
    },
    [board.id, board.data],
  )

  return (
    <Tldraw
      onMount={handleMount}
      components={{
        SharePanel: () => <BoardNamePanel name={board.name} />,
      }}
    />
  )
}
