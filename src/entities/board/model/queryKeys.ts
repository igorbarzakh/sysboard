export const boardQueryKeys = {
  all: ['boards'] as const,
  detail: (boardId: string, currentUserId: string) =>
    [...boardQueryKeys.all, 'detail', boardId, 'viewer', currentUserId] as const,
  workspaceBoards: (workspaceSlug: string, currentUserId: string) =>
    [...boardQueryKeys.all, 'workspace', workspaceSlug, 'viewer', currentUserId] as const,
}
