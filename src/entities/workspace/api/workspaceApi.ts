import type {
  Workspace,
  WorkspaceBoard,
  WorkspaceInviteLink,
  WorkspaceMember,
  WorkspaceMembersData,
} from '../model'

interface ApiError {
  error: string
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as ApiError
    return body.error ?? `Request failed with status ${res.status}`
  } catch {
    return `Request failed with status ${res.status}`
  }
}

export async function getWorkspaces(): Promise<Workspace[]> {
  const res = await fetch('/api/workspaces')
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<Workspace[]>
}

export async function createWorkspace(name: string): Promise<Workspace> {
  const res = await fetch('/api/workspaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<Workspace>
}

export async function updateWorkspace(
  slug: string,
  patch: { description?: string | null; image?: string | null; name?: string },
): Promise<Workspace> {
  const res = await fetch(`/api/workspaces/${slug}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<Workspace>
}

export async function uploadWorkspaceImage(
  slug: string,
  file: File,
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`/api/workspaces/${slug}/avatar`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(await parseError(res))
  const body: unknown = await res.json()
  if (!isWorkspaceImageResponse(body)) {
    throw new Error('Workspace image upload failed')
  }
  return body.image
}

export async function deleteWorkspace(slug: string): Promise<void> {
  const res = await fetch(`/api/workspaces/${slug}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function getWorkspaceMembers(slug: string): Promise<WorkspaceMember[]> {
  const res = await fetch(`/api/workspaces/${slug}/members`)
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<WorkspaceMember[]>
}

export async function getWorkspaceMembersData(
  slug: string,
): Promise<WorkspaceMembersData> {
  const res = await fetch(`/api/workspaces/${slug}/members`)
  if (!res.ok) throw new Error(await parseError(res))
  const body = (await res.json()) as WorkspaceMember[] | WorkspaceMembersData

  if (Array.isArray(body)) {
    return { activeInvites: [], members: body }
  }

  return body
}

export async function createWorkspaceInvite(
  slug: string,
): Promise<WorkspaceInviteLink> {
  const res = await fetch(`/api/workspaces/${slug}/members`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error(await parseError(res))
  const body: unknown = await res.json()
  if (!isWorkspaceInviteLink(body)) {
    throw new Error('Unable to invite member')
  }
  return body
}

export async function revokeWorkspaceInvite(
  slug: string,
  inviteId: string,
): Promise<void> {
  const res = await fetch(`/api/workspaces/${slug}/invites/${inviteId}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function removeWorkspaceMember(
  slug: string,
  userId: string,
): Promise<void> {
  const res = await fetch(`/api/workspaces/${slug}/members`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function leaveWorkspace(slug: string): Promise<void> {
  const res = await fetch(`/api/workspaces/${slug}/members`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ self: true }),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export const removeMember = removeWorkspaceMember

export async function getWorkspaceBoards(slug: string): Promise<WorkspaceBoard[]> {
  const res = await fetch(`/api/workspaces/${slug}/boards`)
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<WorkspaceBoard[]>
}

export async function createWorkspaceBoard(slug: string, name: string): Promise<WorkspaceBoard> {
  const res = await fetch(`/api/workspaces/${slug}/boards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<WorkspaceBoard>
}

function isWorkspaceInviteLink(value: unknown): value is WorkspaceInviteLink {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'token' in value &&
    typeof value.token === 'string' &&
    'createdAt' in value &&
    typeof value.createdAt === 'string' &&
    'expiresAt' in value &&
    typeof value.expiresAt === 'string' &&
    'inviteUrl' in value &&
    typeof value.inviteUrl === 'string'
  )
}

function isWorkspaceImageResponse(value: unknown): value is { image: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'image' in value &&
    typeof value.image === 'string'
  )
}
