import type { ProfileRole } from '@entities/user/model'

interface ProfileResponse {
  image?: string
  user?: {
    image?: string | null
    name?: string | null
    profileRole?: ProfileRole | null
  }
  error?: string
}

export interface UpdateProfilePayload {
  image?: string | null
  name?: string
  profileRole?: ProfileRole | null
}

async function readJsonResponse(response: Response): Promise<ProfileResponse> {
  const body: unknown = await response.json().catch(() => ({}))
  return typeof body === 'object' && body !== null ? body : {}
}

export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/users/avatar', {
    method: 'POST',
    body: formData,
  })
  const body = await readJsonResponse(response)

  if (!response.ok || typeof body.image !== 'string') {
    throw new Error(body.error ?? 'Avatar upload failed')
  }

  return body.image
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await fetch('/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await readJsonResponse(response)

  if (!response.ok || !body.user) {
    throw new Error(body.error ?? 'Profile update failed')
  }

  return body.user
}

export async function deleteAccount(): Promise<void> {
  const response = await fetch('/api/users/me', { method: 'DELETE' })
  const body = await readJsonResponse(response)

  if (!response.ok) {
    throw new Error(body.error ?? 'Account deletion failed')
  }
}
