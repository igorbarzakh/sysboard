import type { UserPlan } from '@shared/lib'
import type { ProfileRole } from './profileRoles'

export interface CurrentUser {
  id: string
  name: string | null
  email: string
  image: string | null
  profileRole: ProfileRole | null
  plan: UserPlan
  provider: string | null
}
