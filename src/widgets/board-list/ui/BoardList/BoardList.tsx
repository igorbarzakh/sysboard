'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getBoards } from '@entities/board/api'
import { BoardCard } from '@entities/board/ui'
import type { Board } from '@entities/board/model'
import { useDeleteBoard } from '@features/delete-board/hooks'
import { useBoardListPreferences } from '../../hooks'
import { sortBoards } from '../../model'
import { BoardListToolbar } from '../BoardListToolbar/BoardListToolbar'
import { BoardListSkeleton } from '../BoardListSkeleton'
import { BoardListEmpty } from '../BoardListEmpty/BoardListEmpty'
import styles from './BoardList.module.scss'

interface BoardListProps {
  workspaceSlug: string
}

export function BoardList({ workspaceSlug }: BoardListProps) {
  const [boards, setBoards] = useState<Board[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { mounted, setSortBy, setView, sortBy, view } =
    useBoardListPreferences()
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
      toast.error('Failed to delete board')
    }
  }

const sortedBoards = useMemo(() => {
    return sortBoards(boards, sortBy)
  }, [boards, sortBy])

  const isEmpty = !isLoading && boards.length === 0

  return (
    <div className={styles.root}>
      {!isEmpty && (
        <BoardListToolbar
          boardCount={boards.length}
          isLoading={isLoading}
          onSortChange={setSortBy}
          onViewChange={setView}
          sortBy={sortBy}
          view={view}
          workspaceSlug={workspaceSlug}
        />
      )}

      {!mounted ? null : boards.length === 0 && !isLoading ? (
        <BoardListEmpty
          workspaceSlug={workspaceSlug}
          boardCount={0}
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
