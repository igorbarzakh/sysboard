'use client'

import { useRouter } from 'next/navigation'
import { LayoutGrid, X } from 'lucide-react'
import { useRecentBoards } from '@entities/board/hooks'
import styles from './RecentBoards.module.scss'

export function RecentBoards() {
  const router = useRouter()
  const { recentBoards, removeRecentBoard } = useRecentBoards()

  if (recentBoards.length === 0) {
    return null
  }

  return (
    <div className={styles.root}>
      <p className={styles.label}>Recent</p>
      {recentBoards.map((board) => (
        <div
          key={board.id}
          onClick={() => router.push(`/board/${board.id}`)}
          className={styles.item}
        >
          <LayoutGrid size={14} className={styles.icon} />
          <span className={styles.name}>{board.name}</span>
          <button
            onClick={(event) => {
              event.stopPropagation()
              removeRecentBoard(board.id)
            }}
            className={styles.remove}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
