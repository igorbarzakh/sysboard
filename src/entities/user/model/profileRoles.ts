export const PROFILE_ROLES = [
  'Student',
  'Educator',
  'Software development',
  'Research',
  'Design',
  'Marketing',
  'Product management',
  'UX Writing',
  'Data analytics',
  'Other',
] as const

export type ProfileRole = (typeof PROFILE_ROLES)[number]

export const PROFILE_ROLE_OPTIONS = PROFILE_ROLES.map((role) => ({
  label: role,
  value: role,
}))

const PROFILE_ROLE_SET = new Set<string>(PROFILE_ROLES)

export function isProfileRole(value: string): value is ProfileRole {
  return PROFILE_ROLE_SET.has(value)
}
