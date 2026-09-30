'use client'

import { useState } from 'react'
import { LiveblocksProvider, RoomProvider } from '@liveblocks/react'
import type { Board } from '@entities/board/model'
import { getInitialRecords } from '../../lib/documentSync'
import { BOARD_IDLE_TIMEOUT_MS } from '../../lib/idleTimer'
import { TldrawCanvas } from '../TldrawCanvas/TldrawCanvas'
import styles from './CanvasEditor.module.scss'

interface Props {
  board: Board
  currentUserId: string
}

export function CanvasEditor({ board, currentUserId }: Props) {
  return (
    <div className={styles.canvas}>
      <CanvasRoom key={board.id} board={board} currentUserId={currentUserId} />
    </div>
  )
}

function CanvasRoom({ board, currentUserId }: Props) {
  const [initialStorage] = useState(() => ({ records: getInitialRecords(board.data) }))

  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
      throttle={32}
      backgroundKeepAliveTimeout={BOARD_IDLE_TIMEOUT_MS}
    >
      <RoomProvider
        id={board.id}
        initialPresence={{ presence: null }}
        initialStorage={initialStorage}
      >
        <TldrawCanvas board={board} currentUserId={currentUserId} />
      </RoomProvider>
    </LiveblocksProvider>
  )
}
