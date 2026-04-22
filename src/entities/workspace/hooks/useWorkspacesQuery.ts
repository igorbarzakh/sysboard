'use client'

import { useQuery } from '@tanstack/react-query'
import { getWorkspaces } from '../api'
import { workspaceQueryKeys } from '../model'

export function useWorkspacesQuery() {
  return useQuery({
    queryKey: workspaceQueryKeys.lists(),
    queryFn: getWorkspaces,
  })
}
