'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { boardQueryKeys, type Board } from '../../model'
import { trackBoardView } from '../../api/boardApi'

interface BoardVisitTrackerProps {
  boardId: string
  currentUserId: string
  workspaceSlug: string
}

export function BoardVisitTracker({
  boardId,
  currentUserId,
  workspaceSlug,
}: BoardVisitTrackerProps) {
  const queryClient = useQueryClient()

  useEffect(() => {
    trackBoardView(boardId)
      .then(({ lastViewedAt }) => {
        const queryKey = boardQueryKeys.workspaceBoards(workspaceSlug, currentUserId)

        queryClient.setQueryData<Board[]>(queryKey, (boards) =>
          boards?.map((board) => {
            if (board.id !== boardId) return board
            return { ...board, lastViewedAt }
          }),
        )

        return queryClient.invalidateQueries({
          queryKey,
        })
      })
      .catch(() => {})
  }, [boardId, currentUserId, queryClient, workspaceSlug])

  return null
}
