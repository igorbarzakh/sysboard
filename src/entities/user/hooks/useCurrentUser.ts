'use client'

import { useSession } from 'next-auth/react'
import type { CurrentUser } from '../model/types'

export function useCurrentUser(): CurrentUser | null {
  const { data: session } = useSession()
  if (!session?.user?.id || !session.user.email) return null

  return {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email,
    image: session.user.image ?? null,
  }
}
