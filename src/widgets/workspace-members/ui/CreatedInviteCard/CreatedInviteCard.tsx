import { Check, Copy } from 'lucide-react'
import type { WorkspaceInviteLink } from '@entities/workspace/model'
import { WORKSPACE_INVITE_TTL_LABEL } from '@shared/lib'
import { Button, Skeleton } from '@shared/ui'
import styles from './CreatedInviteCard.module.scss'

interface CreatedInviteCardProps {
  copied: boolean
  invite: WorkspaceInviteLink
  isInviting: boolean
  onCopy: () => void
}

export function CreatedInviteCard({
  copied,
  invite,
  isInviting,
  onCopy,
}: CreatedInviteCardProps) {
  return (
    <div className={styles.root}>
      {isInviting ? (
        <div className={styles.skeleton}>
          <Skeleton className={styles.skeletonLine} style={{ width: '40%' }} />
          <Skeleton className={styles.skeletonLine} style={{ width: '65%' }} />
          <Skeleton className={styles.skeletonLine} style={{ width: '90%' }} />
        </div>
      ) : (
        <>
          <div className={styles.text}>
            <div className={styles.header}>
              <p className={styles.title}>Invite link created</p>
              <span className={styles.inviteExpiry}>
                Expires in {WORKSPACE_INVITE_TTL_LABEL}
              </span>
            </div>
            <p className={styles.help}>
              Copy and send this link to the invited person.
            </p>
            <p className={styles.value}>{invite.inviteUrl}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            Copy
          </Button>
        </>
      )}
    </div>
  )
}
