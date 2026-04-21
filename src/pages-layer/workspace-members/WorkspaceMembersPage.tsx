'use client'

import { useState } from 'react'
import {
  createWorkspaceInvite,
  removeWorkspaceMember,
  revokeWorkspaceInvite,
} from '@entities/workspace/api'
import type {
  WorkspaceInvite,
  WorkspaceInviteLink,
  WorkspaceMember,
} from '@entities/workspace/model'
import { PLAN_LIMITS } from '@shared/lib'
import {
  CreatedInviteCard,
  InviteSection,
  MembersList,
  PendingInvitesDialog,
  type ActiveInviteState,
} from '@widgets/workspace-members/ui'
import styles from './WorkspaceMembersPage.module.scss'

interface WorkspaceMembersPageProps {
  activeInvites: WorkspaceInvite[]
  canManageMembers: boolean
  currentUserId: string
  members: WorkspaceMember[]
  plan: 'free' | 'pro'
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
  const [invite, setInvite] = useState<WorkspaceInviteLink | null>(null)
  const [isInviting, setIsInviting] = useState(false)
  const [members, setMembers] = useState(initialMembers)
  const [activeInvites, setActiveInvites] = useState<ActiveInviteState[]>(
    initialActiveInvites.map((activeInvite) => ({
      ...activeInvite,
      revoking: false,
    })),
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
      const nextInvite = await createWorkspaceInvite(workspaceSlug)

      setInvite(nextInvite)
      setActiveInvites((prev) => [
        {
          id: nextInvite.id,
          token: nextInvite.token,
          createdAt: nextInvite.createdAt,
          expiresAt: nextInvite.expiresAt,
          revoking: false,
        },
        ...prev,
      ])
    } catch (inviteError) {
      setError(
        inviteError instanceof Error
          ? inviteError.message
          : 'Unable to invite member',
      )
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
      prev.map((activeInvite) =>
        activeInvite.id === id
          ? { ...activeInvite, revoking: true }
          : activeInvite,
      ),
    )

    try {
      await revokeWorkspaceInvite(workspaceSlug, id)

      const isLast = activeInvites.length === 1
      if (isLast) {
        setPendingOpen(false)
        setTimeout(() => {
          setActiveInvites([])
          if (invite?.id === id) setInvite(null)
        }, 200)
      } else {
        setActiveInvites((prev) =>
          prev.filter((activeInvite) => activeInvite.id !== id),
        )
        if (invite?.id === id) setInvite(null)
      }
    } catch (revokeError) {
      setError(
        revokeError instanceof Error
          ? revokeError.message
          : 'Unable to revoke invite',
      )
      setActiveInvites((prev) =>
        prev.map((activeInvite) =>
          activeInvite.id === id
            ? { ...activeInvite, revoking: false }
            : activeInvite,
        ),
      )
    }
  }

  async function handleRemove(userId: string) {
    if (!canManageMembers || removingUserId) return

    setError(null)
    setRemovingUserId(userId)

    try {
      await removeWorkspaceMember(workspaceSlug, userId)
      setMembers((prev) => prev.filter((member) => member.userId !== userId))
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : 'Unable to remove member',
      )
    } finally {
      setRemovingUserId(null)
    }
  }

  function handleCopyPendingLink(token: string, id: string) {
    void navigator.clipboard
      .writeText(`${window.location.origin}/invite/${token}`)
      .then(() => {
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 1500)
      })
  }

  return (
    <section className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>Members</h1>
      </header>

      <InviteSection
        activeInviteCount={activeInvites.length}
        canCreateInvite={canCreateInvite}
        canManageMembers={canManageMembers}
        isInviting={isInviting}
        maxMembers={maxMembers}
        plan={plan}
        slotsFull={slotsFull}
        slotsNearFull={slotsNearFull}
        slotsPercent={slotsPercent}
        usedMembers={usedMembers}
        onCreateInvite={handleCreateInvite}
        onOpenPending={() => setPendingOpen(true)}
      />

      {error ? <p className={styles.error}>{error}</p> : null}

      {invite ? (
        <CreatedInviteCard
          copied={copiedMain}
          invite={invite}
          isInviting={isInviting}
          onCopy={handleCopyInviteLink}
        />
      ) : null}

      <PendingInvitesDialog
        copiedId={copiedId}
        invites={activeInvites}
        open={pendingOpen}
        onCopy={handleCopyPendingLink}
        onOpenChange={setPendingOpen}
        onRevoke={(id) => void handleRevokeInvite(id)}
      />

      <MembersList
        canManageMembers={canManageMembers}
        currentUserId={currentUserId}
        members={members}
        removingUserId={removingUserId}
        onRemove={(userId) => void handleRemove(userId)}
      />
    </section>
  )
}
