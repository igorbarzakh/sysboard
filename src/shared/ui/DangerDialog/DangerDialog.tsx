'use client'

import * as React from 'react'
import { Button } from '../Button'
import { Dialog, DialogContent } from '../Dialog'
import styles from './DangerDialog.module.scss'

interface DangerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon: React.ReactNode
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  isConfirming?: boolean
  onConfirm: () => void
}

export function DangerDialog({
  open,
  onOpenChange,
  icon,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isConfirming = false,
  onConfirm,
}: DangerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.content} showCloseButton={false}>
        <div className={styles.iconWrap}>{icon}</div>
        <div className={styles.body}>
          <p className={styles.title}>{title}</p>
          <p className={styles.description}>{description}</p>
        </div>
        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            disabled={isConfirming}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isConfirming}
            className={styles.confirmButton}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
