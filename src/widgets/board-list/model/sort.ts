import type { Board } from '@entities/board/model'

export type ViewMode = 'grid' | 'list'
export type SortBy = 'name' | 'created' | 'viewed'
export type BoardFilter = 'all' | 'created' | 'shared' | 'favorites'

export const BOARD_FILTER_OPTIONS = [
  { value: 'all', label: 'All boards' },
  { value: 'created', label: 'Created by me' },
  { value: 'shared', label: 'Shared with me' },
  { value: 'favorites', label: 'Favorites' },
] satisfies Array<{ value: BoardFilter; label: string }>

export const SORT_BY_LABELS: Record<SortBy, string> = {
  name: 'Alphabetical',
  created: 'Date created',
  viewed: 'Last viewed',
}

export const SORT_BY_OPTIONS = [
  { value: 'name', label: 'Alphabetical' },
  { value: 'created', label: 'Date created' },
  { value: 'viewed', label: 'Last viewed' },
] satisfies Array<{ value: SortBy; label: string }>

export function normalizeSortBy(value: string | null): SortBy {
  if (value === 'name' || value === 'created' || value === 'viewed') {
    return value
  }

  if (value === 'name-asc') {
    return 'name'
  }

  if (value === 'created-desc') {
    return 'created'
  }

  return 'viewed'
}

export function sortBoards(boards: Board[], sortBy: SortBy): Board[] {
  return [...boards].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name)
    }

    const aDate =
      sortBy === 'created' ? a.createdAt : (a.lastViewedAt ?? a.updatedAt)
    const bDate =
      sortBy === 'created' ? b.createdAt : (b.lastViewedAt ?? b.updatedAt)

    return Date.parse(bDate) - Date.parse(aDate)
  })
}
