'use client'

import { CreateBoardButton } from '@features/create-board/ui'
import { Select } from '@shared/ui'
import {
  SORT_BY_LABELS,
  SORT_BY_OPTIONS,
  type SortBy,
  type ViewMode,
} from '../../model'
import { BoardListViewToggle } from '../BoardListViewToggle/BoardListViewToggle'
import styles from './BoardListToolbar.module.scss'

interface BoardListToolbarProps {
  boardCount: number
  isLoading: boolean
  onSortChange: (value: SortBy) => void
  onViewChange: (value: ViewMode) => void
  sortBy: SortBy
  view: ViewMode
  workspaceSlug: string
}

export function BoardListToolbar({
  boardCount,
  isLoading,
  onSortChange,
  onViewChange,
  sortBy,
  view,
  workspaceSlug,
}: BoardListToolbarProps) {
  return (
    <div className={styles.header}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Boards</h1>

        {boardCount > 0 && !isLoading && (
          <CreateBoardButton
            workspaceSlug={workspaceSlug}
            boardCount={boardCount}
          />
        )}
      </div>

      <div className={styles.headerControls}>
        <label className={styles.sortControl}>
          <Select<SortBy>
            value={sortBy}
            onChange={onSortChange}
            options={SORT_BY_OPTIONS}
            renderValue={(value) => SORT_BY_LABELS[value]}
            disabled={isLoading || boardCount === 0}
          />
        </label>

        <BoardListViewToggle value={view} onChange={onViewChange} />
      </div>
    </div>
  )
}
