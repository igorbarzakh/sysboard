import { Info, Link2 } from 'lucide-react'
import type { UserPlan } from '@shared/lib'
import { WORKSPACE_INVITE_TTL_LABEL, cn } from '@shared/lib'
import { Button, Tooltip } from '@shared/ui'
import styles from './InviteSection.module.scss'

interface InviteSectionProps {
  activeInviteCount: number
  canCreateInvite: boolean
  canManageMembers: boolean
  isInviting: boolean
  maxMembers: number
  plan: UserPlan
  slotsFull: boolean
  slotsNearFull: boolean
  slotsPercent: number
  usedMembers: number
  onCreateInvite: () => void
  onOpenPending: () => void
}

export function InviteSection({
  activeInviteCount,
  canCreateInvite,
  canManageMembers,
  isInviting,
  maxMembers,
  plan,
  slotsFull,
  slotsNearFull,
  slotsPercent,
  usedMembers,
  onCreateInvite,
  onOpenPending,
}: InviteSectionProps) {
  if (!canManageMembers) {
    return <div className={styles.readOnlyNotice}>Managed by the workspace owner.</div>
  }

  return (
    <div className={styles.inviteSection}>
      <div className={styles.inviteCopy}>
        <p className={styles.inviteTitle}>Create invite link</p>
        <p className={styles.inviteHint}>
          Create a one-time link, copy it, and send it manually{' '}
          <Tooltip
            side="top"
            trigger="click"
            content={
              <span
                dangerouslySetInnerHTML={{
                  __html: `Anyone with this link can join&nbsp;&mdash; valid for&nbsp;${WORKSPACE_INVITE_TTL_LABEL}.`,
                }}
              />
            }
          >
            <span className={styles.inviteInfoIcon}>
              <Info size={13} />
            </span>
          </Tooltip>
        </p>
      </div>
      <div className={styles.invite}>
        <div className={styles.inviteLeft}>
          <Button
            type="button"
            className={styles.createButton}
            disabled={!canCreateInvite || isInviting || slotsFull}
            onClick={onCreateInvite}
          >
            <Link2 size={16} />
            {isInviting ? 'Creating...' : 'Create link'}
          </Button>
          {activeInviteCount > 0 ? (
            <button
              type="button"
              className={styles.pendingTrigger}
              disabled={isInviting}
              onClick={onOpenPending}
            >
              Pending invites
              <span className={styles.pendingBadge}>{activeInviteCount}</span>
            </button>
          ) : null}
          {plan === 'free' ? (
            <p className={styles.inviteDisabledHint}>
              Inviting members is available on Pro.
            </p>
          ) : null}
        </div>
        {plan !== 'free' ? (
          <div className={styles.slots}>
            <p className={styles.slotsLabel}>
              <span
                className={cn(
                  styles.slotsCount,
                  slotsFull && styles.slotsCountFull,
                  slotsNearFull && styles.slotsCountNear,
                )}
              >
                {usedMembers}
              </span>
              {' / '}
              {maxMembers}
            </p>
            <div className={styles.slotsBar}>
              <div
                className={cn(
                  styles.slotsFill,
                  slotsFull && styles.slotsFillFull,
                  slotsNearFull && styles.slotsFillNear,
                )}
                style={{ width: `${slotsPercent}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
