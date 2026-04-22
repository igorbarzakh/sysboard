'use client'

import { LayoutGrid, List } from 'lucide-react'
import type { ViewMode } from '../../model'
import styles from './BoardListViewToggle.module.scss'

interface BoardListViewToggleProps {
  disabled?: boolean
  onChange: (value: ViewMode) => void
  value: ViewMode
}

export function BoardListViewToggle({
  disabled = false,
  onChange,
  value,
}: BoardListViewToggleProps) {
  return (
    <div className={styles.root}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('grid')}
        className={styles.button}
        data-active={value === 'grid' ? 'true' : undefined}
        aria-label="Grid view"
      >
        <LayoutGrid size={14} />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('list')}
        className={styles.button}
        data-active={value === 'list' ? 'true' : undefined}
        aria-label="List view"
      >
        <List size={14} />
      </button>
    </div>
  )
}
