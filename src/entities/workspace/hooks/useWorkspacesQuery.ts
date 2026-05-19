'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteWorkspace, getWorkspaces, leaveWorkspace, updateWorkspace } from '../api'
import { workspaceQueryKeys } from '../model'

export function useWorkspacesQuery() {
  return useQuery({
    queryKey: workspaceQueryKeys.lists(),
    queryFn: getWorkspaces,
  })
}

export function useUpdateWorkspaceMutation(workspaceSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patch: {
      description?: string | null
      image?: string | null
      name?: string
    }) =>
      updateWorkspace(workspaceSlug, patch),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.lists() })
    },
  })
}

export function useLeaveWorkspaceMutation(workspaceSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => leaveWorkspace(workspaceSlug),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.lists() })
    },
  })
}

export function useDeleteWorkspaceMutation(workspaceSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteWorkspace(workspaceSlug),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.lists() })
    },
  })
}
