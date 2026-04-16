'use client'

import { LayoutGrid, List } from 'lucide-react'
import type { ViewMode } from '../../model'
import styles from './BoardListViewToggle.module.scss'

interface BoardListViewToggleProps {
  onChange: (value: ViewMode) => void
  value: ViewMode
}

export function BoardListViewToggle({ onChange, value }: BoardListViewToggleProps) {
  return (
    <div className={styles.root}>
      <button
        onClick={() => onChange('grid')}
        className={styles.button}
        data-active={value === 'grid' ? 'true' : undefined}
      >
        <LayoutGrid size={14} />
      </button>
      <button
        onClick={() => onChange('list')}
        className={styles.button}
        data-active={value === 'list' ? 'true' : undefined}
      >
        <List size={14} />
      </button>
    </div>
  )
}
