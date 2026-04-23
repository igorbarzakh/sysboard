'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  useDeleteBoardMutation,
  useRenameBoardMutation,
  useToggleBoardFavoriteMutation,
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
  const [pendingFavoriteIds, setPendingFavoriteIds] = useState<Set<string>>(
    () => new Set(),
  )
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
  const toggleFavoriteMutation = useToggleBoardFavoriteMutation({
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

  async function handleFavoriteToggle(id: string, isFavorite: boolean) {
    if (pendingFavoriteIds.has(id)) return

    setPendingFavoriteIds((ids) => new Set(ids).add(id))

    try {
      await toggleFavoriteMutation.mutateAsync({ id, isFavorite })
    } finally {
      setPendingFavoriteIds((ids) => {
        const nextIds = new Set(ids)
        nextIds.delete(id)
        return nextIds
      })
    }
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

      if (filter === 'favorites') {
        return Boolean(board.isFavorite)
      }

      return true
    })
  }, [currentUserId, filter, sortedBoards])

  const filteredBoardCount = filteredBoards.length
  const resultKey = `${view}-${filter}-${sortBy}`

  return (
    <div className={styles.root}>
      {mounted ? (
        <BoardListToolbar
          boardCount={boards.length}
          boardLimit={boardLimit}
          currentUserId={currentUserId}
          filter={filter}
          isLoading={isLoading}
          onFilterChange={setFilter}
          onSortChange={setSortBy}
          onViewChange={setView}
          sortBy={sortBy}
          view={view}
          workspaceSlug={workspaceSlug}
        />
      ) : null}

      {!mounted ? null : boards.length === 0 && !isLoading ? (
        <BoardListEmpty
          boardCount={0}
          boardLimit={boardLimit}
          currentUserId={currentUserId}
          workspaceSlug={workspaceSlug}
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
                    isFavoritePending={pendingFavoriteIds.has(board.id)}
                    onDelete={handleDelete}
                    onFavoriteToggle={handleFavoriteToggle}
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
                isFavoritePending={pendingFavoriteIds.has(board.id)}
                onDelete={handleDelete}
                onFavoriteToggle={handleFavoriteToggle}
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
