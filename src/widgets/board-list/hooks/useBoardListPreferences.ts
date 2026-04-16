'use client'

import { startTransition, useCallback, useEffect, useState } from 'react'
import { normalizeSortBy, type SortBy, type ViewMode } from '../model'

const BOARD_VIEW_KEY = 'sdb:board-view'
const BOARD_SORT_BY_KEY = 'sdb:board-sort-by'
const LEGACY_BOARD_SORT_KEY = 'sdb:board-sort'

function normalizeViewMode(value: string | null): ViewMode {
  return value === 'list' ? 'list' : 'grid'
}

export function useBoardListPreferences() {
  const [view, setView] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('viewed')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedView = normalizeViewMode(localStorage.getItem(BOARD_VIEW_KEY))
    const savedSortBy = normalizeSortBy(
      localStorage.getItem(BOARD_SORT_BY_KEY) ?? localStorage.getItem(LEGACY_BOARD_SORT_KEY),
    )

    startTransition(() => {
      setView(savedView)
      setSortBy(savedSortBy)
      setMounted(true)
    })
  }, [])

  const updateView = useCallback((nextView: ViewMode) => {
    setView(nextView)
    localStorage.setItem(BOARD_VIEW_KEY, nextView)
  }, [])

  const updateSortBy = useCallback((nextSortBy: SortBy) => {
    setSortBy(nextSortBy)
    localStorage.setItem(BOARD_SORT_BY_KEY, nextSortBy)
  }, [])

  return {
    mounted,
    setSortBy: updateSortBy,
    setView: updateView,
    sortBy,
    view,
  }
}
