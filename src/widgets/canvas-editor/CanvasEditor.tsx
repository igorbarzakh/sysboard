'use client'

import { useCallback, useRef } from 'react'
import { Tldraw, type Editor, type TLStoreSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import { type Board, updateBoard } from '@/entities/board'

interface Props {
  board: Board
}

function BoardNamePanel({ name }: { name: string }) {
  return (
    <div
      style={{
        padding: '0 var(--sp-3)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-body)',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        height: '100%',
      }}
    >
      {name}
    </div>
  )
}

export function CanvasEditor({ board }: Props) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMount = useCallback(
    (editor: Editor) => {
      if (board.data && typeof board.data === 'object') {
        try {
          editor.loadSnapshot(board.data as TLStoreSnapshot)
        } catch {
          // invalid snapshot — start with blank canvas
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
        { scope: 'document', source: 'user' }
      )
    },
    [board.id, board.data]
  )

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      <Tldraw
        onMount={handleMount}
        components={{
          SharePanel: () => <BoardNamePanel name={board.name} />,
        }}
      />
    </div>
  )
}
