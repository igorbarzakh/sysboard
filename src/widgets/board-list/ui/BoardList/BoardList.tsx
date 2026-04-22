'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getBoardsByWorkspace, updateBoard } from '@entities/board/api'
import { BoardCard } from '@entities/board/ui'
import type { Board } from '@entities/board/model'
import { useDeleteBoard } from '@features/delete-board/hooks'
import { useBoardListPreferences } from '../../hooks'
import { sortBoards, type BoardFilter } from '../../model'
import { BoardListToolbar } from '../BoardListToolbar/BoardListToolbar'
import { BoardListSkeleton } from '../BoardListSkeleton'
import { BoardListEmpty } from '../BoardListEmpty/BoardListEmpty'
import styles from './BoardList.module.scss'

interface BoardListProps {
  boardLimit: number
  currentUserId: string
  workspaceSlug: string
}

export function BoardList({
  boardLimit,
  currentUserId,
  workspaceSlug,
}: BoardListProps) {
  const [boards, setBoards] = useState<Board[]>([])
  const [filter, setFilter] = useState<BoardFilter>('recent')
  const [isLoading, setIsLoading] = useState(true)
  const { mounted, setSortBy, setView, sortBy, view } =
    useBoardListPreferences()
  const { deleteBoard } = useDeleteBoard()

  const loadBoards = useCallback(async () => {
    const nextBoards = await getBoardsByWorkspace(workspaceSlug)
    setBoards(nextBoards)
  }, [workspaceSlug])

  useEffect(() => {
    getBoardsByWorkspace(workspaceSlug)
      .then(setBoards)
      .finally(() => setIsLoading(false))
  }, [workspaceSlug])

  useEffect(() => {
    function refreshBoards() {
      void loadBoards()
    }

    window.addEventListener('focus', refreshBoards)
    window.addEventListener('pageshow', refreshBoards)

    return () => {
      window.removeEventListener('focus', refreshBoards)
      window.removeEventListener('pageshow', refreshBoards)
    }
  }, [loadBoards])

  async function handleDelete(id: string) {
    setBoards((prev) => prev.filter((b) => b.id !== id))
    try {
      await deleteBoard(id)
    } catch {
      void loadBoards()
      toast.error('Failed to delete board')
    }
  }

  async function handleRename(id: string, name: string) {
    setBoards((prev) => prev.map((board) => {
      if (board.id !== id) return board
      return { ...board, name }
    }))

    try {
      await updateBoard(id, { name })
    } catch {
      void loadBoards()
    }
  }

  const sortedBoards = useMemo(() => {
    return sortBoards(boards, sortBy)
  }, [boards, sortBy])

  const filteredBoards = useMemo(() => {
    return sortedBoards.filter((board) => {
      if (filter === 'recent') {
        return Boolean(board.lastViewedAt)
      }

      if (filter === 'created') {
        return board.createdById === currentUserId
      }

      if (filter === 'shared') {
        return board.createdById !== currentUserId
      }

      return true
    })
  }, [currentUserId, filter, sortedBoards])

  const filteredBoardCount = filteredBoards.length
  const resultKey = `${view}-${filter}-${sortBy}`

  const isEmpty = !isLoading && boards.length === 0

  return (
    <div className={styles.root}>
      {!isEmpty && (
        <BoardListToolbar
          boardCount={boards.length}
          boardLimit={boardLimit}
          filter={filter}
          isLoading={isLoading}
          onFilterChange={setFilter}
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
          boardLimit={boardLimit}
        />
      ) : !isLoading && filteredBoardCount === 0 ? (
        <div className={styles.filteredEmpty}>
          Could not find any matches. Try adjusting your filters.
        </div>
      ) : view === 'grid' ? (
        isLoading ? (
          <BoardListSkeleton view={view} />
        ) : (
          <div key={resultKey} className={styles.grid}>
            {filteredBoardCount > 0 ? (
              filteredBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  canManage={
                    board.createdById === currentUserId ||
                    board.workspace.ownerId === currentUserId
                  }
                  onDelete={handleDelete}
                  onRename={handleRename}
                />
              ))
            ) : null}
          </div>
        )
      ) : (
        <div key={resultKey} className={styles.list}>
          {filteredBoardCount > 0 ? (
            <div className={styles.listHeader}>
              <span className={styles.listHeaderCell}>Name</span>
              <span className={styles.listHeaderCell}>Last modified</span>
              <span className={styles.listHeaderCell}>Created</span>
            </div>
          ) : null}
          {isLoading ? (
            <BoardListSkeleton view={view} />
          ) : (
            filteredBoardCount > 0 ? (
              filteredBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  canManage={
                    board.createdById === currentUserId ||
                    board.workspace.ownerId === currentUserId
                  }
                  onDelete={handleDelete}
                  onRename={handleRename}
                  view="list"
                />
              ))
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
