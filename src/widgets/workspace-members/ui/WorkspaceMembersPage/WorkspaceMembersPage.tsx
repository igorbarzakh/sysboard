'use client'

import { useState } from 'react'
import { Check, Copy, Link2, Trash2 } from 'lucide-react'
import type { WorkspaceMember } from '@entities/workspace/model'
import type { UserPlan } from '@shared/lib'
import { PLAN_LIMITS, WORKSPACE_INVITE_TTL_LABEL, cn, formatRelativeTime } from '@shared/lib'
import {
  Avatar,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shared/ui'
import styles from './WorkspaceMembersPage.module.scss'

interface ActiveInvite {
  id: string
  token: string
  createdAt: string
  expiresAt: string
}

interface WorkspaceMembersPageProps {
  activeInvites: ActiveInvite[]
  canManageMembers: boolean
  currentUserId: string
  members: WorkspaceMember[]
  plan: UserPlan
  workspaceSlug: string
}

export function WorkspaceMembersPage({
  activeInvites: initialActiveInvites,
  canManageMembers,
  currentUserId,
  members: initialMembers,
  plan,
  workspaceSlug,
}: WorkspaceMembersPageProps) {
  const [error, setError] = useState<string | null>(null)
  const [invite, setInvite] = useState<WorkspaceInviteResponse | null>(null)
  const [isInviting, setIsInviting] = useState(false)
  const [members, setMembers] = useState(initialMembers)
  const [activeInvites, setActiveInvites] = useState<ActiveInviteState[]>(
    initialActiveInvites.map((inv) => ({ ...inv, revoking: false })),
  )
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedMain, setCopiedMain] = useState(false)
  const [pendingOpen, setPendingOpen] = useState(false)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)

  const canCreateInvite = canManageMembers && plan === 'pro'

  const maxMembers = PLAN_LIMITS[plan].maxWorkspaceMembers
  const usedMembers = members.length + activeInvites.length
  const slotsPercent = Math.min((usedMembers / maxMembers) * 100, 100)
  const slotsFull = usedMembers >= maxMembers
  const slotsNearFull = !slotsFull && slotsPercent >= 80

  async function handleCreateInvite() {
    if (!canManageMembers || isInviting) return

    setError(null)
    setIsInviting(true)

    try {
      const response = await fetch(`/api/workspaces/${workspaceSlug}/members`, {
        method: 'POST',
      })
      const body: unknown = await response.json().catch(() => ({}))

      if (!response.ok || !isWorkspaceInvite(body)) {
        const message =
          typeof body === 'object' &&
          body !== null &&
          'error' in body &&
          typeof body.error === 'string'
            ? body.error
            : 'Unable to invite member'
        throw new Error(message)
      }

      setInvite(body)
      setActiveInvites((prev) => [
        { id: body.id, token: body.token, createdAt: body.createdAt, expiresAt: body.expiresAt, revoking: false },
        ...prev,
      ])
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : 'Unable to invite member')
    } finally {
      setIsInviting(false)
    }
  }

  async function handleCopyInviteLink() {
    if (!invite) return
    await navigator.clipboard.writeText(invite.inviteUrl)
    setCopiedMain(true)
    setTimeout(() => setCopiedMain(false), 1500)
  }

  async function handleRevokeInvite(id: string) {
    setActiveInvites((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, revoking: true } : inv)),
    )

    try {
      const response = await fetch(`/api/workspaces/${workspaceSlug}/invites/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => ({}))
        const message =
          typeof body === 'object' &&
          body !== null &&
          'error' in body &&
          typeof body.error === 'string'
            ? body.error
            : 'Unable to revoke invite'
        throw new Error(message)
      }

      const isLast = activeInvites.length === 1
      if (isLast) {
        setPendingOpen(false)
        setTimeout(() => {
          setActiveInvites([])
          if (invite?.id === id) setInvite(null)
        }, 200)
      } else {
        setActiveInvites((prev) => prev.filter((inv) => inv.id !== id))
        if (invite?.id === id) setInvite(null)
      }
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : 'Unable to revoke invite')
      setActiveInvites((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, revoking: false } : inv)),
      )
    }
  }

  async function handleRemove(userId: string) {
    if (!canManageMembers || removingUserId) return

    setError(null)
    setRemovingUserId(userId)

    try {
      const response = await fetch(`/api/workspaces/${workspaceSlug}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => ({}))
        const message =
          typeof body === 'object' &&
          body !== null &&
          'error' in body &&
          typeof body.error === 'string'
            ? body.error
            : 'Unable to remove member'
        throw new Error(message)
      }

      setMembers((prev) => prev.filter((member) => member.userId !== userId))
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to remove member')
    } finally {
      setRemovingUserId(null)
    }
  }

  function handleCopyPendingLink(token: string, id: string) {
    void navigator.clipboard.writeText(`${window.location.origin}/invite/${token}`).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    })
  }

  return (
    <section className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>Members</h1>
      </header>

      {canManageMembers ? (
        <div className={styles.inviteSection}>
          <div className={styles.inviteCopy}>
            <p className={styles.inviteTitle}>Create invite link</p>
            <p className={styles.inviteHint}>
              Create a one-time link, copy it, and send it manually. Anyone signed in with the
              link can join within {WORKSPACE_INVITE_TTL_LABEL}.
            </p>
          </div>
          <div className={styles.invite}>
            <div className={styles.inviteLeft}>
              <Button
                type="button"
                className={styles.createButton}
                disabled={!canCreateInvite || isInviting || slotsFull}
                onClick={handleCreateInvite}
              >
                <Link2 size={16} />
                {isInviting ? 'Creating...' : 'Create link'}
              </Button>
              {activeInvites.length > 0 ? (
                <button
                  type="button"
                  className={styles.pendingTrigger}
                  disabled={isInviting}
                  onClick={() => setPendingOpen(true)}
                >
                  Pending invites
                  <span className={styles.pendingBadge}>{activeInvites.length}</span>
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
                  {' / '}{maxMembers}
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
      ) : (
        <div className={styles.readOnlyNotice}>
          Managed by the workspace owner.
        </div>
      )}

      {error ? <p className={styles.error}>{error}</p> : null}

      {invite ? (
        <div className={styles.inviteLink}>
          {isInviting ? (
            <div className={styles.inviteLinkSkeleton}>
              <div className={styles.skeletonLine} style={{ width: '40%' }} />
              <div className={styles.skeletonLine} style={{ width: '65%' }} />
              <div className={styles.skeletonLine} style={{ width: '90%' }} />
            </div>
          ) : (
            <>
              <div className={styles.inviteLinkText}>
                <div className={styles.inviteLinkHeader}>
                  <p className={styles.inviteLinkTitle}>Invite link created</p>
                  <span className={styles.inviteExpiry}>
                    Expires in {WORKSPACE_INVITE_TTL_LABEL}
                  </span>
                </div>
                <p className={styles.inviteLinkHelp}>Copy and send this link to the invited person.</p>
                <p className={styles.inviteLinkValue}>{invite.inviteUrl}</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleCopyInviteLink}>
                {copiedMain ? <Check size={14} /> : <Copy size={14} />}
                Copy
              </Button>
            </>
          )}
        </div>
      ) : null}

      <Dialog open={pendingOpen} onOpenChange={setPendingOpen}>
        <DialogContent className={styles.pendingDialog}>
          <DialogHeader>
            <DialogTitle>Pending invites</DialogTitle>
          </DialogHeader>
          {activeInvites.length === 0 ? (
            <p className={styles.pendingEmpty}>No active invite links.</p>
          ) : (
            <div className={styles.pendingList}>
              {activeInvites.map((inv) => (
                <div key={inv.id} className={styles.pendingRow}>
                  <div className={styles.pendingIcon}>
                    <Link2 size={14} />
                  </div>
                  <div className={styles.pendingInfo}>
                    <p className={styles.pendingUrl}>{`${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${inv.token}`}</p>
                    <p className={styles.pendingMeta}>
                      Created {formatRelativeTime(inv.createdAt)}
                      {' · '}
                      Expires {formatRelativeTime(inv.expiresAt)}
                    </p>
                  </div>
                  <div className={styles.pendingActions}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyPendingLink(inv.token, inv.id)}
                    >
                      {copiedId === inv.id ? <Check size={13} /> : <Copy size={13} />}
                      Copy
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={styles.revokeButton}
                      disabled={inv.revoking}
                      onClick={() => void handleRevokeInvite(inv.id)}
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

      <div className={styles.list}>
        {members.map((member) => {
          const displayName = member.user.name ?? member.user.email
          const isCurrentUser = member.userId === currentUserId
          const isOwner = member.role === 'owner'
          const canRemove = canManageMembers && !isOwner

          return (
            <div
              key={member.userId}
              className={cn(styles.memberRow, !canRemove && styles.memberRowNoAction)}
            >
              <Avatar name={displayName} image={member.user.image} size="md" />
              <div className={styles.memberInfo}>
                <p className={styles.memberName}>
                  <span>{displayName}</span>
                  {isCurrentUser ? <span className={styles.youBadge}>(You)</span> : null}
                </p>
                <p className={styles.memberEmail}>{member.user.email}</p>
              </div>
              <span className={styles.role} data-role={isOwner ? 'owner' : 'member'}>
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
                  onClick={() => void handleRemove(member.userId)}
                >
                  <Trash2 size={15} />
                </Button>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

interface ActiveInviteState extends ActiveInvite {
  revoking: boolean
}

interface WorkspaceInviteResponse {
  id: string
  token: string
  createdAt: string
  expiresAt: string
  inviteUrl: string
}

function isWorkspaceInvite(value: unknown): value is WorkspaceInviteResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'token' in value &&
    typeof value.token === 'string' &&
    'createdAt' in value &&
    typeof value.createdAt === 'string' &&
    'expiresAt' in value &&
    typeof value.expiresAt === 'string' &&
    'inviteUrl' in value &&
    typeof value.inviteUrl === 'string'
  )
}
