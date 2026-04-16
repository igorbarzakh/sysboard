'use client'

import type { ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '@shared/ui'
import styles from './BoardCardMenu.module.scss'

interface BoardCardMenuProps {
  boardId: string
  children: ReactElement
  onDeleteRequest: () => void
}

export function BoardCardMenu({ boardId, children, onDeleteRequest }: BoardCardMenuProps) {
  const router = useRouter()

  return (
    <ContextMenu>
      <ContextMenuTrigger render={children} />
      <ContextMenuContent className={styles.content}>
        <ContextMenuItem
          onClick={() => router.push(`/board/${boardId}`)}
          className={styles.item}>
          Open
        </ContextMenuItem>
        <ContextMenuItem className={styles.item}>Rename</ContextMenuItem>
        <ContextMenuItem className={styles.item}>Share</ContextMenuItem>
        <ContextMenuItem
          variant="destructive"
          onClick={onDeleteRequest}
          className={styles.itemDestructive}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
