'use client'

import type { KeyboardEvent } from 'react'
import { formatRelativeTime } from '@shared/lib'
import type { Board } from '../../model'
import { BoardCardMenu } from '../BoardCardMenu/BoardCardMenu'
import { BoardPreview } from '../BoardPreview/BoardPreview'
import styles from './BoardCardList.module.scss'

interface BoardCardListProps {
  board: Board
  canManage: boolean
  onNavigate: () => void
  onDeleteRequest: () => void
}

export function BoardCardList({
  board,
  canManage,
  onNavigate,
  onDeleteRequest,
}: BoardCardListProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onNavigate()
    }
  }

  return (
    <BoardCardMenu boardId={board.id} canManage={canManage} onDeleteRequest={onDeleteRequest}>
      <article
        className={styles.card}
        role="button"
        tabIndex={0}
        onClick={onNavigate}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.cell}>
          <div className={styles.thumb}>
            <BoardPreview data={board.data} />
          </div>
          <h3 className={styles.name}>{board.name}</h3>
        </div>
        <time dateTime={board.updatedAt} className={styles.time}>
          {formatRelativeTime(board.updatedAt)}
        </time>
        <time dateTime={board.createdAt} className={styles.time}>
          {formatRelativeTime(board.createdAt)}
        </time>
      </article>
    </BoardCardMenu>
  )
}
