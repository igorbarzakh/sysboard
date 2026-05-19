'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { AlertCircle, CheckCircle2, LogIn, Users } from 'lucide-react'
import { DiscordIcon, GoogleIcon } from '@features/auth-modal/ui'
import { Button } from '@shared/ui'
import styles from './InviteAcceptPage.module.scss'

type InviteStatus =
  | 'ready'
  | 'unauthenticated'
  | 'not_found'
  | 'expired'
  | 'accepted'
  | 'already_member'

interface InviteAcceptPageProps {
  status: InviteStatus
  token: string
  workspaceName?: string
  workspaceSlug?: string
}

export function InviteAcceptPage({
  status,
  token,
  workspaceName,
  workspaceSlug,
}: InviteAcceptPageProps) {
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
      setIsAccepting(false)
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon} data-status={status}>
          {status === 'ready' || status === 'already_member' ? (
            <CheckCircle2 size={24} />
          ) : status === 'unauthenticated' ? (
            <LogIn size={24} />
          ) : (
            <AlertCircle size={24} />
          )}
        </div>

        <div className={styles.heading}>
          <p className={styles.kicker}>Workspace invite</p>
          <h1 className={styles.title}>
            {status === 'ready' ? (
              <>
                Join{' '}
                <span className={styles.workspaceName}>
                  {workspaceName ?? 'workspace'}
                </span>
              </>
            ) : (
              getTitle(status, workspaceName)
            )}
          </h1>
          <p className={styles.description}>{getDescription(status)}</p>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.actions}>
          {status === 'unauthenticated' ? (
            <>
              <Button
                type="button"
                variant="outline"
                className={styles.actionButton}
                onClick={() => signIn('google', { callbackUrl })}
              >
                <GoogleIcon />
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className={styles.actionButton}
                onClick={() => signIn('discord', { callbackUrl })}
              >
                <DiscordIcon />
                Continue with Discord
              </Button>
            </>
          ) : null}

          {status === 'ready' ? (
            <Button
              type="button"
              className={styles.actionButton}
              disabled={isAccepting}
              onClick={handleAccept}
            >
              <Users size={16} />
              {isAccepting ? 'Joining...' : 'Join workspace'}
            </Button>
          ) : null}

          {status === 'already_member' && workspaceSlug ? (
            <Button
              type="button"
              className={styles.actionButton}
              onClick={() => router.push(`/workspace/${workspaceSlug}`)}
            >
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
  if (status === 'accepted') return 'Invite unavailable'
  if (status === 'already_member') return 'Already a member'
  return 'Invite not found'
}

function getDescription(status: InviteStatus): string {
  if (status === 'ready') return 'Accept the invite to access boards.'
  if (status === 'unauthenticated') return 'Sign in to join this workspace with this invite link.'
  if (status === 'expired') return 'Ask the workspace owner to create a new invite link.'
  if (status === 'accepted') return 'This invite link has already been used. Ask the workspace owner for a new invite.'
  if (status === 'already_member') return 'You already have access to this workspace.'
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
