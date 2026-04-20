const DEFAULT_AVATAR_BUCKET = 'avatars'
const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

interface UploadUserAvatarParams {
  contentType: string
  data: ArrayBuffer
  source: 'manual' | 'oauth'
  userId: string
}

interface SupabaseStorageObject {
  name?: unknown
}

function getSupabaseStorageConfig() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.SUPABASE_AVATARS_BUCKET ?? DEFAULT_AVATAR_BUCKET

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase avatar storage is not configured')
  }

  return {
    bucket,
    serviceRoleKey,
    url: url.replace(/\/$/, ''),
  }
}

function getAvatarExtension(contentType: string) {
  switch (contentType) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    default:
      return null
  }
}

function getPublicAvatarUrl(baseUrl: string, bucket: string, path: string) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`
}

function extractStoragePath(publicUrl: string, baseUrl: string, bucket: string): string | null {
  const prefix = `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/`
  if (!publicUrl.startsWith(prefix)) return null
  return publicUrl
    .slice(prefix.length)
    .split('/')
    .map(decodeURIComponent)
    .join('/')
}

export function isAllowedAvatarType(contentType: string) {
  return ALLOWED_AVATAR_TYPES.has(contentType)
}

export function isOwnedAvatarUrl(imageUrl: string): boolean {
  try {
    const { bucket, url } = getSupabaseStorageConfig()
    const prefix = `${url}/storage/v1/object/public/${encodeURIComponent(bucket)}/`
    return imageUrl.startsWith(prefix)
  } catch {
    return false
  }
}

export function isAllowedAvatarSize(size: number) {
  return size > 0 && size <= MAX_AVATAR_BYTES
}

export async function uploadUserAvatar({
  contentType,
  data,
  source,
  userId,
}: UploadUserAvatarParams) {
  const extension = getAvatarExtension(contentType)

  if (!extension || !isAllowedAvatarSize(data.byteLength)) {
    throw new Error('Invalid avatar file')
  }

  const { bucket, serviceRoleKey, url } = getSupabaseStorageConfig()
  const path = `users/${userId}/${source}-${Date.now()}.${extension}`
  const uploadUrl = `${url}/storage/v1/object/${encodeURIComponent(bucket)}/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      'Cache-Control': '31536000',
      'Content-Type': contentType,
      apikey: serviceRoleKey,
      'x-upsert': 'false',
    },
    body: data,
  })

  if (!response.ok) {
    throw new Error(`Supabase avatar upload failed with status ${response.status}`)
  }

  return getPublicAvatarUrl(url, bucket, path)
}

async function listUserAvatarPaths(userId: string) {
  const { bucket, serviceRoleKey, url } = getSupabaseStorageConfig()
  const prefix = `users/${userId}/`
  const limit = 100
  const paths: string[] = []
  let offset = 0

  while (true) {
    const response = await fetch(
      `${url}/storage/v1/object/list/${encodeURIComponent(bucket)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          apikey: serviceRoleKey,
        },
        body: JSON.stringify({ limit, offset, prefix }),
      },
    )

    if (!response.ok) {
      throw new Error(`Supabase avatar list failed with status ${response.status}`)
    }

    const objects: unknown = await response.json()
    if (!Array.isArray(objects) || objects.length === 0) break

    objects.forEach((object: SupabaseStorageObject) => {
      if (typeof object.name !== 'string') return
      paths.push(
        object.name.startsWith(prefix)
          ? object.name
          : `${prefix}${object.name}`,
      )
    })

    if (objects.length < limit) break
    offset += limit
  }

  return paths
}

export async function deleteAvatarByUrl(imageUrl: string): Promise<void> {
  const { bucket, serviceRoleKey, url } = getSupabaseStorageConfig()
  const path = extractStoragePath(imageUrl, url, bucket)
  if (!path) return

  const response = await fetch(`${url}/storage/v1/object/${encodeURIComponent(bucket)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      apikey: serviceRoleKey,
    },
    body: JSON.stringify({ prefixes: [path] }),
  })

  if (!response.ok) {
    throw new Error(`Supabase avatar delete failed with status ${response.status}`)
  }
}

export async function deleteUserAvatars(userId: string) {
  const { bucket, serviceRoleKey, url } = getSupabaseStorageConfig()
  const paths = await listUserAvatarPaths(userId)

  if (paths.length === 0) return

  const response = await fetch(`${url}/storage/v1/object/${encodeURIComponent(bucket)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      apikey: serviceRoleKey,
    },
    body: JSON.stringify({ prefixes: paths }),
  })

  if (!response.ok) {
    throw new Error(`Supabase avatar delete failed with status ${response.status}`)
  }
}

export async function importOAuthAvatar(userId: string, imageUrl: string | null | undefined) {
  if (!imageUrl) return null

  const response = await fetch(imageUrl)
  if (!response.ok) return null

  const contentType = response.headers.get('content-type')?.split(';')[0]?.toLowerCase()
  const contentLength = Number(response.headers.get('content-length') ?? 0)

  if (!contentType || !isAllowedAvatarType(contentType)) return null
  if (contentLength > 0 && !isAllowedAvatarSize(contentLength)) return null

  const data = await response.arrayBuffer()
  if (!isAllowedAvatarSize(data.byteLength)) return null

  return uploadUserAvatar({
    contentType,
    data,
    source: 'oauth',
    userId,
  })
}
