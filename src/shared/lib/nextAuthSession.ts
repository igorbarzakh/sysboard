interface UpdatedSessionUser {
  image?: string | null
  name?: string | null
  profileRole?: string | null
}

function readNullableStringField(
  source: Record<string, unknown>,
  field: keyof UpdatedSessionUser,
) {
  if (!Object.prototype.hasOwnProperty.call(source, field)) {
    return undefined
  }

  const value = source[field]
  return typeof value === 'string' || value === null ? value : undefined
}

export function getUpdatedSessionUser(session: unknown): UpdatedSessionUser {
  if (typeof session !== 'object' || session === null) return {}

  const source = session as Record<string, unknown>
  const updated: UpdatedSessionUser = {}
  const image = readNullableStringField(source, 'image')
  const name = readNullableStringField(source, 'name')
  const profileRole = readNullableStringField(source, 'profileRole')

  if (image !== undefined) updated.image = image
  if (name !== undefined) updated.name = name
  if (profileRole !== undefined) updated.profileRole = profileRole

  return updated
}
