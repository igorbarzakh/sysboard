'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteBoard, toggleBoardFavorite, updateBoard } from '../api'
import { boardQueryKeys, type Board } from '../model'

interface BoardMutationParams {
  currentUserId: string
  workspaceSlug: string
}

export function useToggleBoardFavoriteMutation({
  currentUserId,
  workspaceSlug,
}: BoardMutationParams) {
  const queryClient = useQueryClient()
  const queryKey = boardQueryKeys.workspaceBoards(workspaceSlug, currentUserId)

  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      toggleBoardFavorite(id, isFavorite),
    onMutate: async ({ id, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousBoards = queryClient.getQueryData<Board[]>(queryKey)

      queryClient.setQueryData<Board[]>(queryKey, (boards) =>
        boards?.map((board) => {
          if (board.id !== id) return board
          return { ...board, isFavorite }
        }),
      )

      return { previousBoards }
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousBoards)
    },
    onSuccess: (result, variables) => {
      queryClient.setQueryData<Board[]>(queryKey, (boards) =>
        boards?.map((board) => {
          if (board.id !== variables.id) return board
          return { ...board, isFavorite: result.isFavorite }
        }),
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

export function useRenameBoardMutation({
  currentUserId,
  workspaceSlug,
}: BoardMutationParams) {
  const queryClient = useQueryClient()
  const queryKey = boardQueryKeys.workspaceBoards(workspaceSlug, currentUserId)

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateBoard(id, { name }),
    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousBoards = queryClient.getQueryData<Board[]>(queryKey)

      queryClient.setQueryData<Board[]>(queryKey, (boards) =>
        boards?.map((board) => {
          if (board.id !== id) return board
          return { ...board, name }
        }),
      )

      return { previousBoards }
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousBoards)
    },
    onSuccess: (updatedBoard) => {
      queryClient.setQueryData<Board[]>(queryKey, (boards) =>
        boards?.map((board) => {
          if (board.id !== updatedBoard.id) return board
          return { ...board, name: updatedBoard.name }
        }),
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

export function useDeleteBoardMutation({
  currentUserId,
  workspaceSlug,
}: BoardMutationParams) {
  const queryClient = useQueryClient()
  const queryKey = boardQueryKeys.workspaceBoards(workspaceSlug, currentUserId)

  return useMutation({
    mutationFn: deleteBoard,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey })
      const previousBoards = queryClient.getQueryData<Board[]>(queryKey)

      queryClient.setQueryData<Board[]>(queryKey, (boards) =>
        boards?.filter((board) => board.id !== id),
      )

      return { previousBoards }
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousBoards)
    },
  })
}
