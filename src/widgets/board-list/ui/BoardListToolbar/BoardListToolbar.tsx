'use client'

import { CreateBoardButton } from '@features/create-board/ui'
import { Select } from '@shared/ui'
import {
  BOARD_FILTER_OPTIONS,
  SORT_BY_LABELS,
  SORT_BY_OPTIONS,
  type BoardFilter,
  type SortBy,
  type ViewMode,
} from '../../model'
import { BoardListViewToggle } from '../BoardListViewToggle/BoardListViewToggle'
import styles from './BoardListToolbar.module.scss'

interface BoardListToolbarProps {
  boardCount: number
  boardLimit: number
  filter: BoardFilter
  isLoading: boolean
  onFilterChange: (value: BoardFilter) => void
  onSortChange: (value: SortBy) => void
  onViewChange: (value: ViewMode) => void
  sortBy: SortBy
  view: ViewMode
  workspaceSlug: string
}

export function BoardListToolbar({
  boardCount,
  boardLimit,
  filter,
  isLoading,
  onFilterChange,
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
            limit={boardLimit}
          />
        )}
      </div>

      <div className={styles.headerControls}>
        <div className={styles.tabs} role="tablist" aria-label="Board filters">
          {BOARD_FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={filter === option.value}
              className={styles.tab}
              data-active={filter === option.value}
              disabled={isLoading || boardCount === 0}
              onClick={() => onFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className={styles.viewControls}>
          <label className={styles.sortControl}>
            <Select<SortBy>
              value={sortBy}
              onChange={onSortChange}
              options={SORT_BY_OPTIONS}
              renderValue={(value) => SORT_BY_LABELS[value]}
              disabled={isLoading || boardCount === 0}
              triggerClassName={styles.sortTrigger}
            />
          </label>

          <BoardListViewToggle value={view} onChange={onViewChange} />
        </div>
      </div>
    </div>
  )
}
