'use client'

import type { ChangeEvent, KeyboardEvent, RefObject } from 'react'
import { formatRelativeTime } from '@shared/lib'
import type { Board } from '../../model'
import { BoardCardMenu } from '../BoardCardMenu/BoardCardMenu'
import { BoardPreview } from '../BoardPreview/BoardPreview'
import styles from './BoardCardList.module.scss'

interface BoardCardListProps {
  board: Board
  canManage: boolean
  draftName: string
  inputRef: RefObject<HTMLInputElement | null>
  isRenaming: boolean
  isSavingName: boolean
  maxNameLength: number
  onNavigate: () => void
  onDeleteRequest: () => void
  onRenameCommit: () => void
  onRenameDraftChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRenameKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onRenameRequest: () => void
}

export function BoardCardList({
  board,
  canManage,
  draftName,
  inputRef,
  isRenaming,
  isSavingName,
  maxNameLength,
  onNavigate,
  onDeleteRequest,
  onRenameCommit,
  onRenameDraftChange,
  onRenameKeyDown,
  onRenameRequest,
}: BoardCardListProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onNavigate()
    }
  }

  return (
    <BoardCardMenu
      boardId={board.id}
      canManage={canManage}
      onDeleteRequest={onDeleteRequest}
      onRenameRequest={onRenameRequest}
    >
      <article
        className={styles.card}
        data-renaming={isRenaming ? true : undefined}
        role="button"
        tabIndex={0}
        onClick={onNavigate}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.cell}>
          <div className={styles.thumb}>
            <BoardPreview data={board.data} />
          </div>
          {isRenaming ? (
            <input
              ref={inputRef}
              aria-label="Board name"
              className={styles.nameInput}
              disabled={isSavingName}
              maxLength={maxNameLength}
              value={draftName}
              onBlur={onRenameCommit}
              onChange={onRenameDraftChange}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={onRenameKeyDown}
            />
          ) : (
            <h3 className={styles.name} title={board.name}>
              {board.name}
            </h3>
          )}
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
