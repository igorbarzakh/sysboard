'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createWorkspaceInvite,
  removeWorkspaceMember,
  revokeWorkspaceInvite,
} from '../api'
import {
  workspaceQueryKeys,
  type WorkspaceInviteLink,
  type WorkspaceMembersData,
} from '../model'

export function useCreateWorkspaceInviteMutation(workspaceSlug: string) {
  const queryClient = useQueryClient()
  const queryKey = workspaceQueryKeys.members(workspaceSlug)

  return useMutation({
    mutationFn: () => createWorkspaceInvite(workspaceSlug),
    onSuccess: (invite) => {
      queryClient.setQueryData<WorkspaceMembersData>(queryKey, (data) => {
        if (!data) return data
        return {
          ...data,
          activeInvites: [toWorkspaceInvite(invite), ...data.activeInvites],
        }
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

export function useRevokeWorkspaceInviteMutation(workspaceSlug: string) {
  const queryClient = useQueryClient()
  const queryKey = workspaceQueryKeys.members(workspaceSlug)

  return useMutation({
    mutationFn: (inviteId: string) =>
      revokeWorkspaceInvite(workspaceSlug, inviteId),
    onMutate: async (inviteId) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<WorkspaceMembersData>(queryKey)

      queryClient.setQueryData<WorkspaceMembersData>(queryKey, (data) => {
        if (!data) return data
        return {
          ...data,
          activeInvites: data.activeInvites.filter((invite) => invite.id !== inviteId),
        }
      })

      return { previousData }
    },
    onError: (_error, _inviteId, context) => {
      queryClient.setQueryData(queryKey, context?.previousData)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

export function useRemoveWorkspaceMemberMutation(workspaceSlug: string) {
  const queryClient = useQueryClient()
  const queryKey = workspaceQueryKeys.members(workspaceSlug)

  return useMutation({
    mutationFn: (userId: string) => removeWorkspaceMember(workspaceSlug, userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<WorkspaceMembersData>(queryKey)

      queryClient.setQueryData<WorkspaceMembersData>(queryKey, (data) => {
        if (!data) return data
        return {
          ...data,
          members: data.members.filter((member) => member.userId !== userId),
        }
      })

      return { previousData }
    },
    onError: (_error, _userId, context) => {
      queryClient.setQueryData(queryKey, context?.previousData)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

function toWorkspaceInvite(invite: WorkspaceInviteLink) {
  return {
    id: invite.id,
    token: invite.token,
    createdAt: invite.createdAt,
    expiresAt: invite.expiresAt,
  }
}
