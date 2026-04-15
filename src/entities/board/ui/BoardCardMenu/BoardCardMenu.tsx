'use client'

import { useRouter } from 'next/navigation'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@shared/ui'
import styles from './BoardCardMenu.module.scss'

interface BoardCardMenuProps {
  boardId: string
  boardName: string
  onDeleteRequest: () => void
}

export function BoardCardMenu({ boardId, onDeleteRequest }: BoardCardMenuProps) {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(e) => e.stopPropagation()}
        className={styles.trigger}>
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" sideOffset={4} className={styles.content}>
        <DropdownMenuItem
          onClick={(e) => { e.stopPropagation(); router.push(`/board/${boardId}`) }}
          className={styles.item}>
          Open
        </DropdownMenuItem>
        <DropdownMenuItem className={styles.item}>Rename</DropdownMenuItem>
        <DropdownMenuItem className={styles.item}>Share</DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={(e) => { e.stopPropagation(); onDeleteRequest() }}
          className={styles.itemDestructive}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
