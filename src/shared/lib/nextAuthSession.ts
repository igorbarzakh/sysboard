export function getUpdatedSessionImage(session: unknown) {
  if (typeof session !== 'object' || session === null) return null

  const image = (session as { image?: unknown }).image
  return typeof image === 'string' ? image : null
}
