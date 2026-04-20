'use client'

import { Trash2 } from 'lucide-react'
import { DangerDialog } from '@shared/ui'

interface DeleteBoardDialogProps {
  boardName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteBoardDialog({ boardName, open, onOpenChange, onConfirm }: DeleteBoardDialogProps) {
  return (
    <DangerDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={<Trash2 size={22} />}
      title="Delete board?"
      description={`"${boardName}" will be permanently deleted. This action cannot be undone.`}
      confirmLabel="Delete"
      onConfirm={() => { onOpenChange(false); onConfirm() }}
    />
  )
}
