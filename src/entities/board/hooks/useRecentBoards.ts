'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'sdb:recent-boards'
const MAX_RECENT = 5

export interface RecentBoard {
  id: string
  name: string
  workspaceSlug: string
}

function readFromStorage(): RecentBoard[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RecentBoard[]) : []
  } catch {
    return []
  }
}

export function useRecentBoards() {
  const [recentBoards, setRecentBoards] = useState<RecentBoard[]>([])

  useEffect(() => {
    setRecentBoards(readFromStorage())
  }, [])

  const addRecentBoard = useCallback((board: RecentBoard) => {
    const current = readFromStorage()
    const filtered = current.filter((b) => b.id !== board.id)
    const next = [board, ...filtered].slice(0, MAX_RECENT)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setRecentBoards(next)
  }, [])

  const removeRecentBoard = useCallback((id: string) => {
    const next = readFromStorage().filter((b) => b.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setRecentBoards(next)
  }, [])

  return { recentBoards, addRecentBoard, removeRecentBoard }
}
