export const boardQueryKeys = {
  all: ['boards'] as const,
  workspaceBoards: (workspaceSlug: string, currentUserId: string) =>
    [...boardQueryKeys.all, 'workspace', workspaceSlug, 'viewer', currentUserId] as const,
}
