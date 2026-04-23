'use client'

import type { Board } from '@entities/board/model'
import { TldrawCanvas } from '../TldrawCanvas/TldrawCanvas'
import styles from './CanvasEditor.module.scss'

interface Props {
  board: Board
}

export function CanvasEditor({ board }: Props) {
  return (
    <div className={styles.canvas}>
      <TldrawCanvas board={board} />
    </div>
  )
}
