import { DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const DEFAULT_AVATAR_BUCKET = 'avatars'
const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

interface UploadUserAvatarParams {
  contentType: string
  data: ArrayBuffer
  source: 'manual' | 'oauth'
  userId: string
}

interface UploadWorkspaceAvatarParams {
  contentType: string
  data: ArrayBuffer
  source: 'manual'
  workspaceId: string
}

function getStorageConfig() {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const region = process.env.AWS_REGION
  const bucket = process.env.AWS_S3_BUCKET ?? DEFAULT_AVATAR_BUCKET

  if (!endpoint || !accessKeyId || !secretAccessKey || !region) {
    throw new Error('Neon avatar storage is not configured')
  }

  return { endpoint: endpoint.replace(/\/$/, ''), accessKeyId, secretAccessKey, region, bucket }
}

let client: S3Client | undefined

function getStorageClient() {
  if (!client) {
    const { endpoint, accessKeyId, secretAccessKey, region } = getStorageConfig()
    client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
      requestChecksumCalculation: 'WHEN_REQUIRED',
    })
  }
  return client
}

function getAvatarExtension(contentType: string) {
  switch (contentType) {
    case 'image/jpeg': return 'jpg'
    case 'image/png': return 'png'
    case 'image/webp': return 'webp'
    default: return null
  }
}

function getPublicAvatarPrefix() {
  const { endpoint, bucket } = getStorageConfig()
  return `${endpoint}/${encodeURIComponent(bucket)}/`
}

function extractStoragePath(publicUrl: string): string | null {
  const prefix = getPublicAvatarPrefix()
  if (!publicUrl.startsWith(prefix)) return null
  try {
    const url = new URL(publicUrl)
    if (!url.href.startsWith(prefix) || url.search || url.hash) return null
    return url.href.slice(prefix.length).split('/').map(decodeURIComponent).join('/') || null
  } catch {
    return null
  }
}

export function isAllowedAvatarType(contentType: string) {
  return ALLOWED_AVATAR_TYPES.has(contentType)
}

export function isOwnedAvatarUrl(imageUrl: string): boolean {
  try {
    return extractStoragePath(imageUrl) !== null
  } catch {
    return false
  }
}

export function isAllowedAvatarSize(size: number) {
  return size > 0 && size <= MAX_AVATAR_BYTES
}

async function uploadAvatar(contentType: string, data: ArrayBuffer, prefix: string, source: string) {
  const extension = getAvatarExtension(contentType)
  if (!extension || !isAllowedAvatarSize(data.byteLength)) {
    throw new Error('Invalid avatar file')
  }

  const { bucket } = getStorageConfig()
  const path = `${prefix}/${source}-${Date.now()}.${extension}`
  await getStorageClient().send(new PutObjectCommand({
    Bucket: bucket,
    Key: path,
    Body: new Uint8Array(data),
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }))
  return `${getPublicAvatarPrefix()}${path.split('/').map(encodeURIComponent).join('/')}`
}

export async function uploadUserAvatar({ contentType, data, source, userId }: UploadUserAvatarParams) {
  return uploadAvatar(contentType, data, `users/${userId}`, source)
}

export async function uploadWorkspaceAvatar({ contentType, data, source, workspaceId }: UploadWorkspaceAvatarParams) {
  return uploadAvatar(contentType, data, `workspaces/${workspaceId}`, source)
}

async function deleteAvatarPrefix(prefix: string) {
  const { bucket } = getStorageConfig()
  const paths: string[] = []
  let continuationToken: string | undefined
  do {
    const result = await getStorageClient().send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }))
    for (const object of result.Contents ?? []) {
      if (object.Key) paths.push(object.Key)
    }
    if (result.IsTruncated && !result.NextContinuationToken) {
      throw new Error('Neon avatar list returned an incomplete page')
    }
    continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined
  } while (continuationToken)

  for (let offset = 0; offset < paths.length; offset += 1000) {
    const result = await getStorageClient().send(new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: paths.slice(offset, offset + 1000).map((Key) => ({ Key })) },
    }))
    if (result.Errors?.length) throw new Error('Neon avatar delete failed')
  }
}

export async function deleteAvatarByUrl(imageUrl: string): Promise<void> {
  const path = extractStoragePath(imageUrl)
  if (!path) return
  const { bucket } = getStorageConfig()
  await getStorageClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: path }))
}

export async function deleteUserAvatars(userId: string) {
  return deleteAvatarPrefix(`users/${userId}/`)
}

export async function deleteWorkspaceAvatars(workspaceId: string) {
  return deleteAvatarPrefix(`workspaces/${workspaceId}/`)
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
