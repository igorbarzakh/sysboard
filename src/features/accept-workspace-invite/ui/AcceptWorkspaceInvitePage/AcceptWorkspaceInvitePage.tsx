'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { AlertCircle, CheckCircle2, LogIn, Users } from 'lucide-react'
import { Button } from '@shared/ui'
import styles from './AcceptWorkspaceInvitePage.module.scss'

type InviteStatus =
  | 'ready'
  | 'unauthenticated'
  | 'not_found'
  | 'expired'
  | 'accepted'

interface AcceptWorkspaceInvitePageProps {
  status: InviteStatus
  token: string
  workspaceName?: string
  workspaceSlug?: string
}

export function AcceptWorkspaceInvitePage({
  status,
  token,
  workspaceName,
  workspaceSlug,
}: AcceptWorkspaceInvitePageProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)

  const callbackUrl = `/invite/${token}`

  async function handleAccept() {
    setError(null)
    setIsAccepting(true)

    try {
      const response = await fetch(`/api/invites/${token}/accept`, { method: 'POST' })
      const body: unknown = await response.json().catch(() => ({}))

      if (!response.ok || !isAcceptInviteResponse(body)) {
        const message =
          typeof body === 'object' &&
          body !== null &&
          'error' in body &&
          typeof body.error === 'string'
            ? body.error
            : 'Unable to accept invite'
        throw new Error(message)
      }

      router.push(`/workspace/${body.workspaceSlug}`)
      router.refresh()
    } catch (acceptError) {
      setError(acceptError instanceof Error ? acceptError.message : 'Unable to accept invite')
    } finally {
      setIsAccepting(false)
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon} data-status={status}>
          {status === 'ready' || status === 'accepted' ? (
            <CheckCircle2 size={24} />
          ) : status === 'unauthenticated' ? (
            <LogIn size={24} />
          ) : (
            <AlertCircle size={24} />
          )}
        </div>

        <div className={styles.heading}>
          <p className={styles.kicker}>Workspace invite</p>
          <h1 className={styles.title}>{getTitle(status, workspaceName)}</h1>
          <p className={styles.description}>{getDescription(status)}</p>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.actions}>
          {status === 'unauthenticated' ? (
            <>
              <Button type="button" variant="outline" onClick={() => signIn('google', { callbackUrl })}>
                Continue with Google
              </Button>
              <Button type="button" variant="outline" onClick={() => signIn('discord', { callbackUrl })}>
                Continue with Discord
              </Button>
            </>
          ) : null}

          {status === 'ready' ? (
            <Button type="button" disabled={isAccepting} onClick={handleAccept}>
              <Users size={16} />
              {isAccepting ? 'Joining...' : 'Join workspace'}
            </Button>
          ) : null}

          {status === 'accepted' && workspaceSlug ? (
            <Button type="button" onClick={() => router.push(`/workspace/${workspaceSlug}`)}>
              Open workspace
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function getTitle(status: InviteStatus, workspaceName?: string): string {
  if (status === 'ready') return `Join ${workspaceName ?? 'workspace'}`
  if (status === 'unauthenticated') return 'Sign in to accept'
  if (status === 'expired') return 'Invite expired'
  if (status === 'accepted') return 'Invite already used'
  return 'Invite not found'
}

function getDescription(status: InviteStatus): string {
  if (status === 'ready') return 'Accept the invite to access boards and create new ones.'
  if (status === 'unauthenticated') return 'Sign in to join this workspace with this invite link.'
  if (status === 'expired') return 'Ask the workspace owner to create a new invite link.'
  if (status === 'accepted') return 'This invite has already been accepted.'
  return 'The link is invalid or has been removed.'
}

interface AcceptInviteResponse {
  workspaceSlug: string
}

function isAcceptInviteResponse(value: unknown): value is AcceptInviteResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'workspaceSlug' in value &&
    typeof value.workspaceSlug === 'string'
  )
}
