'use client'

import { useEffect, useMemo, useState, startTransition } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { getBoards } from '@entities/board/api'
import { BoardCard } from '@entities/board/ui'
import type { Board } from '@entities/board/model'
import { CreateBoardButton } from '@features/create-board/ui'
import { useDeleteBoard } from '@features/delete-board/hooks'
import type { WorkspaceBoard } from '@entities/workspace/model'
import { BoardListSkeleton } from '../BoardListSkeleton'
import { BoardListEmpty } from '../BoardListEmpty/BoardListEmpty'
import styles from './BoardList.module.scss'

type ViewMode = 'grid' | 'list'
type SortMode = 'updated-desc' | 'created-desc' | 'name-asc'

interface BoardListProps {
  workspaceSlug: string
}

export function BoardList({ workspaceSlug }: BoardListProps) {
  const [boards, setBoards] = useState<Board[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('grid')
  const [sort, setSort] = useState<SortMode>('updated-desc')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = (localStorage.getItem('sdb:board-view') as ViewMode | null) ?? 'grid'
    const savedSort = (localStorage.getItem('sdb:board-sort') as SortMode | null) ?? 'updated-desc'
    startTransition(() => {
      setView(saved)
      setSort(savedSort)
      setMounted(true)
    })
  }, [])

  function handleViewChange(v: ViewMode) {
    setView(v)
    localStorage.setItem('sdb:board-view', v)
  }

  function handleSortChange(value: SortMode) {
    setSort(value)
    localStorage.setItem('sdb:board-sort', value)
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
      if (sort === 'name-asc') {
        return a.name.localeCompare(b.name)
      }

      const aDate = sort === 'created-desc' ? a.createdAt : a.updatedAt
      const bDate = sort === 'created-desc' ? b.createdAt : b.updatedAt
      return Date.parse(bDate) - Date.parse(aDate)
    })
  }, [boards, sort])

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Boards</h1>

          <label className={styles.sortControl}>
            <span className={styles.sortLabel}>Sort by</span>
            <select
              value={sort}
              onChange={(event) => handleSortChange(event.target.value as SortMode)}
              className={styles.sortSelect}
              disabled={isLoading || boards.length === 0}>
              <option value="updated-desc">Last modified</option>
              <option value="created-desc">Created</option>
              <option value="name-asc">Name</option>
            </select>
          </label>
        </div>

        <div className={styles.headerControls}>
          {boards.length > 0 && !isLoading && (
            <CreateBoardButton
              workspaceSlug={workspaceSlug}
              boardCount={boards.length}
              onSuccess={handleCreated}
            />
          )}

          <div className={styles.viewToggle}>
            <button
              onClick={() => handleViewChange('grid')}
              className={styles.viewBtn}
              data-active={view === 'grid' ? 'true' : undefined}>
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => handleViewChange('list')}
              className={styles.viewBtn}
              data-active={view === 'list' ? 'true' : undefined}>
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {!mounted ? null : isLoading ? (
        <BoardListSkeleton view={view} />
      ) : boards.length === 0 ? (
        <BoardListEmpty workspaceSlug={workspaceSlug} boardCount={0} onCreated={handleCreated} />
      ) : view === 'grid' ? (
        <div className={styles.grid}>
          {sortedBoards.map((board) => (
            <BoardCard key={board.id} board={board} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className={styles.list}>
          <div className={styles.listHeader}>
            <span className={styles.listHeaderCell}>Name</span>
            <span className={styles.listHeaderCell}>Last modified</span>
            <span className={styles.listHeaderCell}>Created</span>
            <span />
          </div>
          {sortedBoards.map((board) => (
            <BoardCard key={board.id} board={board} onDelete={handleDelete} view="list" />
          ))}
        </div>
      )}
    </div>
  )
}
