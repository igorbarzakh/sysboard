import type { UserPlan } from '@/shared/lib/constants'

export type WorkspaceRole = 'owner' | 'admin' | 'member'

export interface WorkspaceMember {
  userId: string
  role: WorkspaceRole
  joinedAt: string
  user: { id: string; name: string | null; image: string | null }
}

export interface Workspace {
  id: string
  name: string
  slug: string
  ownerId: string
  plan: UserPlan
  createdAt: string
  updatedAt: string
  owner: { id: string; name: string | null; image: string | null }
  members: WorkspaceMember[]
  boardCount: number
}
