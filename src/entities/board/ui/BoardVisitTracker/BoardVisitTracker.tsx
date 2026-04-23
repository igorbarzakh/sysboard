'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { boardQueryKeys, type Board } from '../../model'
import { trackBoardView } from '../../api/boardApi'

const VIEW_TRACK_DEDUP_MS = 5000
const recentTrackedViews = new Map<string, number>()

interface BoardVisitTrackerProps {
  board: Board
  currentUserId: string
  workspaceSlug: string
}

export function BoardVisitTracker({
  board,
  currentUserId,
  workspaceSlug,
}: BoardVisitTrackerProps) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const visitKey = `${currentUserId}:${board.id}`
    const lastTrackedAt = recentTrackedViews.get(visitKey)
    const now = Date.now()

    if (lastTrackedAt && now - lastTrackedAt < VIEW_TRACK_DEDUP_MS) {
      return
    }

    recentTrackedViews.set(visitKey, now)

    const queryKey = boardQueryKeys.workspaceBoards(workspaceSlug, currentUserId)

    queryClient.setQueryData<Board[]>(queryKey, (boards) => {
      if (!boards) return [board]
      if (boards.some((item) => item.id === board.id)) return boards
      return [board, ...boards]
    })

    trackBoardView(board.id)
      .then(({ lastViewedAt }) => {
        queryClient.setQueryData<Board[]>(queryKey, (boards) =>
          boards?.map((item) => {
            if (item.id !== board.id) return item
            return { ...item, lastViewedAt }
          }),
        )

        return queryClient.invalidateQueries({
          queryKey,
        })
      })
      .catch(() => {})
  }, [board, currentUserId, queryClient, workspaceSlug])

  return null
}
