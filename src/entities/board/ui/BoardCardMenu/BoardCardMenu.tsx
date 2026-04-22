'use client'

import type { ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '@shared/ui'
import styles from './BoardCardMenu.module.scss'

interface BoardCardMenuProps {
  boardId: string
  canManage: boolean
  children: ReactElement
  onDeleteRequest: () => void
  onRenameRequest: () => void
}

export function BoardCardMenu({
  boardId,
  canManage,
  children,
  onDeleteRequest,
  onRenameRequest,
}: BoardCardMenuProps) {
  const router = useRouter()

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/board/${boardId}`)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger render={children} />
      <ContextMenuContent className={styles.content}>
        <ContextMenuItem
          onClick={() => router.push(`/board/${boardId}`)}
          className={styles.item}>
          Open
        </ContextMenuItem>
        {canManage ? (
          <ContextMenuItem onClick={onRenameRequest} className={styles.item}>
            Rename
          </ContextMenuItem>
        ) : null}
        <ContextMenuItem onClick={() => void copyLink()} className={styles.item}>
          Copy link
        </ContextMenuItem>
        <ContextMenuItem className={styles.item}>Share</ContextMenuItem>
        {canManage ? (
          <ContextMenuItem
            variant="destructive"
            onClick={onDeleteRequest}
            className={styles.itemDestructive}>
            Delete
          </ContextMenuItem>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  )
}
