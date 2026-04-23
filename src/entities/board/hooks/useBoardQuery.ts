'use client'

import { useQuery } from '@tanstack/react-query'
import { getBoard } from '../api'
import { boardQueryKeys } from '../model'

interface UseBoardQueryParams {
  boardId: string
  currentUserId: string
}

export function useBoardQuery({ boardId, currentUserId }: UseBoardQueryParams) {
  return useQuery({
    queryKey: boardQueryKeys.detail(boardId, currentUserId),
    queryFn: () => getBoard(boardId),
    enabled: Boolean(boardId && currentUserId),
  })
}
