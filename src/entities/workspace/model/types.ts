import type { UserPlan } from '@/shared/lib/constants'

export type WorkspaceRole = 'owner' | 'admin' | 'member'

export interface WorkspaceMember {
  userId: string
  role: WorkspaceRole
  joinedAt: string
  user: { id: string; name: string | null; email: string; image: string | null }
}

export interface Workspace {
  id: string
  name: string
  slug: string
  ownerId: string
  plan: UserPlan
  createdAt: string
  updatedAt: string
  members: WorkspaceMember[]
  _count: { boards: number }
}

/**
 * Board as seen from the workspace entity.
 * Mirrors entities/board Board — kept separate to respect FSD cross-slice rules.
 */
export interface WorkspaceBoard {
  id: string
  name: string
  workspaceId: string
  data: unknown
  createdAt: string
  updatedAt: string
  workspace: { id: string; name: string; slug: string }
  members: Array<{
    userId: string
    role: 'editor'
    joinedAt: string
    user: { id: string; name: string | null; image: string | null }
  }>
}
