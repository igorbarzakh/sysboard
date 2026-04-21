import { Check, Copy, Link2 } from 'lucide-react'
import type { WorkspaceInvite } from '@entities/workspace/model'
import { formatRelativeTime } from '@shared/lib'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shared/ui'
import styles from './PendingInvitesDialog.module.scss'

export interface ActiveInviteState extends WorkspaceInvite {
  revoking: boolean
}

interface PendingInvitesDialogProps {
  copiedId: string | null
  invites: ActiveInviteState[]
  open: boolean
  onCopy: (token: string, id: string) => void
  onOpenChange: (open: boolean) => void
  onRevoke: (id: string) => void
}

export function PendingInvitesDialog({
  copiedId,
  invites,
  open,
  onCopy,
  onOpenChange,
  onRevoke,
}: PendingInvitesDialogProps) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.pendingDialog}>
        <DialogHeader>
          <DialogTitle>Pending invites</DialogTitle>
        </DialogHeader>
        {invites.length === 0 ? (
          <p className={styles.pendingEmpty}>No active invite links.</p>
        ) : (
          <div className={styles.pendingList}>
            {invites.map((invite) => (
              <div key={invite.id} className={styles.pendingRow}>
                <div className={styles.pendingIcon}>
                  <Link2 size={14} />
                </div>
                <div className={styles.pendingInfo}>
                  <p className={styles.pendingUrl}>
                    {`${origin}/invite/${invite.token}`}
                  </p>
                  <p className={styles.pendingMeta}>
                    Created {formatRelativeTime(invite.createdAt)}
                    {' · '}
                    Expires {formatRelativeTime(invite.expiresAt)}
                  </p>
                </div>
                <div className={styles.pendingActions}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onCopy(invite.token, invite.id)}
                  >
                    {copiedId === invite.id ? (
                      <Check size={13} />
                    ) : (
                      <Copy size={13} />
                    )}
                    Copy
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={styles.revokeButton}
                    disabled={invite.revoking}
                    onClick={() => onRevoke(invite.id)}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
