import type { Board } from '../model'

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

export async function getBoards(): Promise<Board[]> {
  const res = await fetch('/api/boards')
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<Board[]>
}

export async function getBoardsByWorkspace(slug: string): Promise<Board[]> {
  const res = await fetch(`/api/workspaces/${slug}/boards`)
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<Board[]>
}

export async function deleteBoard(id: string): Promise<void> {
  const res = await fetch(`/api/boards/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function updateBoard(
  id: string,
  patch: { name?: string; data?: unknown },
): Promise<Board> {
  const res = await fetch(`/api/boards/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<Board>
}
