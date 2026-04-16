'use client'

import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'sdb:recent-boards'
const STORAGE_CHANGE_EVENT = 'sdb:recent-boards-change'
const MAX_RECENT = 5
const EMPTY_RECENT_BOARDS: RecentBoard[] = []

export interface RecentBoard {
  id: string
  name: string
  workspaceSlug: string
  viewedAt?: number
}

let cachedRaw: string | null = null
let cachedSnapshot: RecentBoard[] = EMPTY_RECENT_BOARDS

function getSnapshot(): RecentBoard[] {
  if (typeof window === 'undefined') return EMPTY_RECENT_BOARDS

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === cachedRaw) return cachedSnapshot

    cachedRaw = raw
    cachedSnapshot = raw ? (JSON.parse(raw) as RecentBoard[]) : EMPTY_RECENT_BOARDS
    return cachedSnapshot
  } catch {
    cachedRaw = null
    cachedSnapshot = EMPTY_RECENT_BOARDS
    return cachedSnapshot
  }
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onStoreChange()
  }
  const handleLocalChange = () => onStoreChange()

  window.addEventListener('storage', handleStorage)
  window.addEventListener(STORAGE_CHANGE_EVENT, handleLocalChange)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(STORAGE_CHANGE_EVENT, handleLocalChange)
  }
}

function writeToStorage(next: RecentBoard[]): void {
  const raw = JSON.stringify(next)
  localStorage.setItem(STORAGE_KEY, raw)
  cachedRaw = raw
  cachedSnapshot = next
  window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT))
}

export function useRecentBoards() {
  const recentBoards = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_RECENT_BOARDS)

  const addRecentBoard = useCallback((board: RecentBoard) => {
    const current = getSnapshot()
    const filtered = current.filter((b) => b.id !== board.id)
    const next = [{ ...board, viewedAt: Date.now() }, ...filtered].slice(0, MAX_RECENT)
    writeToStorage(next)
  }, [])

  const removeRecentBoard = useCallback((id: string) => {
    const next = getSnapshot().filter((b) => b.id !== id)
    writeToStorage(next)
  }, [])

  return { recentBoards, addRecentBoard, removeRecentBoard }
}
