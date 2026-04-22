export const workspaceQueryKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceQueryKeys.all, 'list'] as const,
  members: (workspaceSlug: string) =>
    [...workspaceQueryKeys.all, 'members', workspaceSlug] as const,
}
