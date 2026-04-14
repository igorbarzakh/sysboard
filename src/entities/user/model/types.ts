import type { UserPlan } from '@/shared/lib/constants'

export interface CurrentUser {
  id: string
  name: string | null
  email: string
  image: string | null
  plan: UserPlan
}
