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

export async function getBoard(id: string): Promise<Board> {
  const res = await fetch(`/api/boards/${id}`)
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<Board>
}

export async function createBoard(
  workspaceSlug: string,
  name: string,
): Promise<Board> {
  const res = await fetch(`/api/workspaces/${workspaceSlug}/boards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<Board>
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

interface TrackBoardViewResult {
  lastViewedAt: string
}

export async function trackBoardView(id: string): Promise<TrackBoardViewResult> {
  const res = await fetch(`/api/boards/${id}/view`, { method: 'POST' })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<TrackBoardViewResult>
}

interface ToggleBoardFavoriteResult {
  isFavorite: boolean
}

export async function toggleBoardFavorite(
  id: string,
  isFavorite: boolean,
): Promise<ToggleBoardFavoriteResult> {
  const res = await fetch(`/api/boards/${id}/favorite`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isFavorite }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<ToggleBoardFavoriteResult>
}
