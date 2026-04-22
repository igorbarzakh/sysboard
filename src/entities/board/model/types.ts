export type BoardRole = 'editor'

export interface BoardMember {
  userId: string
  role: BoardRole
  joinedAt: string
  user: { id: string; name: string | null; image: string | null }
}

export interface Board {
  id: string
  name: string
  workspaceId: string
  createdById: string
  data: unknown
  createdAt: string
  lastViewedAt?: string | null
  updatedAt: string
  workspace: { id: string; name: string; ownerId?: string; slug: string }
  members: BoardMember[]
}
