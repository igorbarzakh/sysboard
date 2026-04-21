import { Trash2 } from 'lucide-react'
import type { WorkspaceMember } from '@entities/workspace/model'
import { Avatar, Button } from '@shared/ui'
import styles from './MembersList.module.scss'

interface MembersListProps {
  canManageMembers: boolean
  currentUserId: string
  members: WorkspaceMember[]
  removingUserId: string | null
  onRemove: (userId: string) => void
}

export function MembersList({
  canManageMembers,
  currentUserId,
  members,
  removingUserId,
  onRemove,
}: MembersListProps) {
  return (
    <div className={styles.list}>
      {members.map((member) => {
        const displayName = member.user.name ?? member.user.email
        const isCurrentUser = member.userId === currentUserId
        const isOwner = member.role === 'owner'
        const canRemove = canManageMembers && !isOwner

        return (
          <div key={member.userId} className={styles.memberRow}>
            <Avatar name={displayName} image={member.user.image} size="md" />
            <div className={styles.memberInfo}>
              <p className={styles.memberName}>
                <span>{displayName}</span>
                {isCurrentUser ? (
                  <span className={styles.youBadge}>(You)</span>
                ) : null}
              </p>
              <p className={styles.memberEmail}>{member.user.email}</p>
            </div>
            <span
              className={styles.role}
              data-role={isOwner ? 'owner' : 'member'}
            >
              {isOwner ? 'Owner' : 'Member'}
            </span>
            {canRemove ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className={styles.removeButton}
                disabled={removingUserId === member.userId}
                title="Remove member"
                onClick={() => onRemove(member.userId)}
              >
                <Trash2 size={15} />
              </Button>
            ) : (
              <span />
            )}
          </div>
        )
      })}
    </div>
  )
}
