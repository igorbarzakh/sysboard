'use client'

import { LayoutGrid, List } from 'lucide-react'
import { CreateBoardButton } from '@features/create-board/ui'
import type { WorkspaceBoard } from '@entities/workspace/model'
import { Select } from '@shared/ui'
import { SORT_BY_LABELS, SORT_BY_OPTIONS, type SortBy, type ViewMode } from '../../model'
import styles from '../BoardList/BoardList.module.scss'

interface BoardListToolbarProps {
  boardCount: number
  isLoading: boolean
  onCreated: (board: WorkspaceBoard) => void
  onSortChange: (value: SortBy) => void
  onViewChange: (value: ViewMode) => void
  sortBy: SortBy
  view: ViewMode
  workspaceSlug: string
}

export function BoardListToolbar({
  boardCount,
  isLoading,
  onCreated,
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
            onSuccess={onCreated}
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
            triggerClassName={styles.sortTrigger}
          />
        </label>

        <div className={styles.viewToggle}>
          <button
            onClick={() => onViewChange('grid')}
            className={styles.viewBtn}
            data-active={view === 'grid' ? 'true' : undefined}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={styles.viewBtn}
            data-active={view === 'list' ? 'true' : undefined}
          >
            <List size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
