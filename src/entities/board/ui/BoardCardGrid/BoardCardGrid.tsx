'use client'

import { formatRelativeTime } from '@shared/lib'
import type { Board } from '../../model'
import { BoardCardMenu } from '../BoardCardMenu/BoardCardMenu'
import styles from './BoardCardGrid.module.scss'

interface BoardCardGridProps {
  board: Board
  onNavigate: () => void
  onDeleteRequest: () => void
}

export function BoardCardGrid({ board, onNavigate, onDeleteRequest }: BoardCardGridProps) {
  return (
    <article className={styles.card} onClick={onNavigate}>
      <div className={styles.preview} />
      <div className={styles.body}>
        <div className={styles.row}>
          <h3 className={styles.name}>{board.name}</h3>
          <BoardCardMenu boardId={board.id} boardName={board.name} onDeleteRequest={onDeleteRequest} />
        </div>
        <time dateTime={board.updatedAt} className={styles.time}>
          Edited {formatRelativeTime(board.updatedAt)}
        </time>
      </div>
    </article>
  )
}
