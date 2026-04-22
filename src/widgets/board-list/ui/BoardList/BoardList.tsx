'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  useDeleteBoardMutation,
  useRenameBoardMutation,
  useWorkspaceBoardsQuery,
} from '@entities/board/hooks'
import { BoardCard } from '@entities/board/ui'
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
  const [filter, setFilter] = useState<BoardFilter>('all')
  const { mounted, setSortBy, setView, sortBy, view } =
    useBoardListPreferences()
  const {
    data: boards = [],
    isPending: isLoading,
  } = useWorkspaceBoardsQuery({ currentUserId, workspaceSlug })
  const deleteBoardMutation = useDeleteBoardMutation({
    currentUserId,
    workspaceSlug,
  })
  const renameBoardMutation = useRenameBoardMutation({
    currentUserId,
    workspaceSlug,
  })

  async function handleDelete(id: string) {
    try {
      await deleteBoardMutation.mutateAsync(id)
    } catch {
      toast.error('Failed to delete board')
    }
  }

  async function handleRename(id: string, name: string) {
    await renameBoardMutation.mutateAsync({ id, name })
  }

  const sortedBoards = useMemo(() => {
    return sortBoards(boards, sortBy)
  }, [boards, sortBy])

  const filteredBoards = useMemo(() => {
    return sortedBoards.filter((board) => {
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
            {filteredBoardCount > 0
              ? filteredBoards.map((board) => (
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
              : null}
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
          ) : filteredBoardCount > 0 ? (
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
          ) : null}
        </div>
      )}
    </div>
  )
}
