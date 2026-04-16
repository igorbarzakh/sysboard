'use client'

import { useEffect, useMemo, useState, startTransition } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { getBoards } from '@entities/board/api'
import { BoardCard } from '@entities/board/ui'
import type { Board } from '@entities/board/model'
import { CreateBoardButton } from '@features/create-board/ui'
import { useDeleteBoard } from '@features/delete-board/hooks'
import type { WorkspaceBoard } from '@entities/workspace/model'
import { Select } from '@shared/ui'
import { BoardListSkeleton } from '../BoardListSkeleton'
import { BoardListEmpty } from '../BoardListEmpty/BoardListEmpty'
import styles from './BoardList.module.scss'

type ViewMode = 'grid' | 'list'
type SortBy = 'name' | 'created' | 'viewed'

const SORT_BY_LABELS: Record<SortBy, string> = {
  name: 'Alphabetical',
  created: 'Date created',
  viewed: 'Last viewed',
}

const SORT_BY_OPTIONS = [
  { value: 'name', label: 'Alphabetical' },
  { value: 'created', label: 'Date created' },
  { value: 'viewed', label: 'Last viewed' },
] satisfies Array<{ value: SortBy; label: string }>

function getSavedSortBy(): SortBy {
  const saved = localStorage.getItem('sdb:board-sort-by')

  if (saved === 'name' || saved === 'created' || saved === 'viewed') {
    return saved
  }

  const legacy = localStorage.getItem('sdb:board-sort')

  if (legacy === 'name-asc') {
    return 'name'
  }

  if (legacy === 'created-desc') {
    return 'created'
  }

  return 'viewed'
}

interface BoardListProps {
  workspaceSlug: string
}

export function BoardList({ workspaceSlug }: BoardListProps) {
  const [boards, setBoards] = useState<Board[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('viewed')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved =
      (localStorage.getItem('sdb:board-view') as ViewMode | null) ?? 'grid'
    const savedSortBy = getSavedSortBy()

    startTransition(() => {
      setView(saved)
      setSortBy(savedSortBy)
      setMounted(true)
    })
  }, [])

  function handleViewChange(v: ViewMode) {
    setView(v)
    localStorage.setItem('sdb:board-view', v)
  }

  function handleSortByChange(value: SortBy) {
    setSortBy(value)
    localStorage.setItem('sdb:board-sort-by', value)
  }

  const { deleteBoard } = useDeleteBoard()

  useEffect(() => {
    getBoards()
      .then(setBoards)
      .finally(() => setIsLoading(false))
  }, [])

  async function handleDelete(id: string) {
    setBoards((prev) => prev.filter((b) => b.id !== id))
    try {
      await deleteBoard(id)
    } catch {
      getBoards().then(setBoards)
    }
  }

  function handleCreated(board: WorkspaceBoard) {
    setBoards((prev) => [board as Board, ...prev])
  }

  const sortedBoards = useMemo(() => {
    return [...boards].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }

      const aDate = sortBy === 'created' ? a.createdAt : a.updatedAt
      const bDate = sortBy === 'created' ? b.createdAt : b.updatedAt

      return Date.parse(bDate) - Date.parse(aDate)
    })
  }, [boards, sortBy])

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Boards</h1>

          {boards.length > 0 && !isLoading && (
            <CreateBoardButton
              workspaceSlug={workspaceSlug}
              boardCount={boards.length}
              onSuccess={handleCreated}
            />
          )}
        </div>

        <div className={styles.headerControls}>
          <label className={styles.sortControl}>
            <Select<SortBy>
              value={sortBy}
              onChange={handleSortByChange}
              options={SORT_BY_OPTIONS}
              renderValue={(value) => SORT_BY_LABELS[value]}
              disabled={isLoading || boards.length === 0}
              triggerClassName={styles.sortTrigger}
            />
          </label>

          <div className={styles.viewToggle}>
            <button
              onClick={() => handleViewChange('grid')}
              className={styles.viewBtn}
              data-active={view === 'grid' ? 'true' : undefined}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => handleViewChange('list')}
              className={styles.viewBtn}
              data-active={view === 'list' ? 'true' : undefined}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {!mounted ? null : boards.length === 0 && !isLoading ? (
        <BoardListEmpty
          workspaceSlug={workspaceSlug}
          boardCount={0}
          onCreated={handleCreated}
        />
      ) : view === 'grid' ? (
        isLoading ? (
          <BoardListSkeleton view={view} />
        ) : (
          <div className={styles.grid}>
            {sortedBoards.map((board) => (
              <BoardCard key={board.id} board={board} onDelete={handleDelete} />
            ))}
          </div>
        )
      ) : (
        <div className={styles.list}>
          <div className={styles.listHeader}>
            <span className={styles.listHeaderCell}>Name</span>
            <span className={styles.listHeaderCell}>Last modified</span>
            <span className={styles.listHeaderCell}>Created</span>
            <span />
          </div>
          {isLoading ? (
            <BoardListSkeleton view={view} />
          ) : (
            sortedBoards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onDelete={handleDelete}
                view="list"
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
