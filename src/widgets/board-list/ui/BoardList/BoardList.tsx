'use client'

import { useEffect, useState, startTransition } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { getBoards } from '@entities/board/api'
import { BoardCard } from '@entities/board/ui'
import type { Board } from '@entities/board/model'
import { CreateBoardButton } from '@features/create-board/ui'
import { useDeleteBoard } from '@features/delete-board/hooks'
import type { WorkspaceBoard } from '@entities/workspace/model'
import { SkeletonCard, SkeletonRow } from '../BoardListSkeleton/BoardListSkeleton'
import { BoardListEmpty } from '../BoardListEmpty/BoardListEmpty'
import styles from './BoardList.module.scss'

type ViewMode = 'grid' | 'list'

interface BoardListProps {
  workspaceSlug: string
}

export function BoardList({ workspaceSlug }: BoardListProps) {
  const [boards, setBoards] = useState<Board[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('grid')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = (localStorage.getItem('sdb:board-view') as ViewMode | null) ?? 'grid'
    startTransition(() => {
      setView(saved)
      setMounted(true)
    })
  }, [])

  function handleViewChange(v: ViewMode) {
    setView(v)
    localStorage.setItem('sdb:board-view', v)
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

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Boards</h1>

        <div className={styles.headerActions}>
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
        view === 'grid' ? (
          <div className={styles.grid}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className={styles.list}>
            <div className={styles.listHeader}>
              <span className={styles.listHeaderCell}>Name</span>
              <span className={styles.listHeaderCell}>Last modified</span>
              <span className={styles.listHeaderCell}>Created</span>
              <span />
            </div>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        )
      ) : boards.length === 0 ? (
        <BoardListEmpty workspaceSlug={workspaceSlug} boardCount={0} onCreated={handleCreated} />
      ) : view === 'grid' ? (
        <div className={styles.grid}>
          {boards.map((board) => (
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
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} onDelete={handleDelete} view="list" />
          ))}
        </div>
      )}
    </div>
  )
}
