export interface BoardMember {
  userId: string
  role: 'owner' | 'editor'
  joinedAt: string
  user: { id: string; name: string | null; image: string | null }
}

export interface Board {
  id: string
  name: string
  ownerId: string
  data: unknown
  createdAt: string
  updatedAt: string
  owner: { id: string; name: string | null; image: string | null }
  members: BoardMember[]
}
