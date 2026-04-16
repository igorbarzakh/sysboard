'use client'

import { useRouter } from 'next/navigation'
import { LayoutGrid, X } from 'lucide-react'
import { useRecentBoards } from '@entities/board/hooks'
import styles from '../WorkspaceSidebar/WorkspaceSidebar.module.scss'

export function RecentBoards() {
  const router = useRouter()
  const { recentBoards, removeRecentBoard } = useRecentBoards()

  if (recentBoards.length === 0) {
    return null
  }

  return (
    <div className={styles.recent}>
      <p className={styles.recentLabel}>Recent</p>
      {recentBoards.map((board) => (
        <div
          key={board.id}
          onClick={() => router.push(`/board/${board.id}`)}
          className={styles.recentItem}
        >
          <LayoutGrid size={14} className={styles.recentIcon} />
          <span className={styles.recentName}>{board.name}</span>
          <button
            onClick={(event) => {
              event.stopPropagation()
              removeRecentBoard(board.id)
            }}
            className={styles.recentRemove}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
