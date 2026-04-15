'use client'

import { formatRelativeTime } from '@shared/lib'
import type { Board } from '../../model'
import { BoardCardMenu } from '../BoardCardMenu/BoardCardMenu'
import styles from './BoardCardList.module.scss'

interface BoardCardListProps {
  board: Board
  onNavigate: () => void
  onDeleteRequest: () => void
}

export function BoardCardList({ board, onNavigate, onDeleteRequest }: BoardCardListProps) {
  return (
    <article className={styles.card} onClick={onNavigate}>
      <div className={styles.cell}>
        <div className={styles.thumb} />
        <h3 className={styles.name}>{board.name}</h3>
      </div>
      <time dateTime={board.updatedAt} className={styles.time}>
        {formatRelativeTime(board.updatedAt)}
      </time>
      <time dateTime={board.createdAt} className={styles.time}>
        {formatRelativeTime(board.createdAt)}
      </time>
      <BoardCardMenu boardId={board.id} boardName={board.name} onDeleteRequest={onDeleteRequest} />
    </article>
  )
}
