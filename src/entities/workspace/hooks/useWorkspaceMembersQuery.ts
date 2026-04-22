'use client'

import { useQuery } from '@tanstack/react-query'
import { getWorkspaceMembersData } from '../api'
import { workspaceQueryKeys } from '../model'

export function useWorkspaceMembersQuery(workspaceSlug: string) {
  return useQuery({
    queryKey: workspaceQueryKeys.members(workspaceSlug),
    queryFn: () => getWorkspaceMembersData(workspaceSlug),
    enabled: Boolean(workspaceSlug),
  })
}
