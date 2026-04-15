'use client'

import { signIn } from 'next-auth/react'
import { Dialog, DialogContent, DialogTitle } from '@shared/ui'
import { Button } from '@shared/ui'
import { GoogleIcon, DiscordIcon } from './OAuthIcons'
import styles from './AuthModal.module.scss'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className={styles.content}>
        <div className={styles.body}>
          <div className={styles.heading}>
            <DialogTitle className={styles.title}>
              Welcome to Sysboard
            </DialogTitle>
            <p className={styles.subtitle}>Sign in to start designing</p>
          </div>

          <div className={styles.providers}>
            <Button
              variant="outline"
              className={styles.oauthBtn}
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className={styles.oauthBtn}
              onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
            >
              <DiscordIcon />
              Continue with Discord
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
