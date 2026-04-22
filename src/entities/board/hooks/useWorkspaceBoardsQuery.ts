'use client'

import { useQuery } from '@tanstack/react-query'
import { getBoardsByWorkspace } from '../api'
import { boardQueryKeys } from '../model'

interface UseWorkspaceBoardsQueryParams {
  currentUserId: string
  workspaceSlug: string
}

export function useWorkspaceBoardsQuery({
  currentUserId,
  workspaceSlug,
}: UseWorkspaceBoardsQueryParams) {
  return useQuery({
    queryKey: boardQueryKeys.workspaceBoards(workspaceSlug, currentUserId),
    queryFn: () => getBoardsByWorkspace(workspaceSlug),
    enabled: Boolean(currentUserId && workspaceSlug),
  })
}
