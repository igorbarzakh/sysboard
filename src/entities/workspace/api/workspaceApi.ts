import type { Workspace, WorkspaceMember, WorkspaceBoard } from '../model'

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
  patch: { name: string },
): Promise<Workspace> {
  const res = await fetch(`/api/workspaces/${slug}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<Workspace>
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

export async function inviteMember(slug: string, email: string): Promise<WorkspaceMember> {
  const res = await fetch(`/api/workspaces/${slug}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<WorkspaceMember>
}

export async function removeMember(slug: string, userId: string): Promise<void> {
  const res = await fetch(`/api/workspaces/${slug}/members`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

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
