'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { useCurrentUser } from '@entities/user/hooks'
import { UserSettingsModal } from '@features/user-settings-modal'
import { Avatar, Skeleton } from '@shared/ui'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@shared/ui'
import styles from './UserMenu.module.scss'

export function UserMenu() {
  const { status } = useSession()
  const user = useCurrentUser()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  if (status === 'loading') {
    return <Skeleton className={styles.skeletonTrigger} />
  }

  if (!user) return null

  const isPro = user.plan === 'pro'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className={styles.trigger}>
          <div className={styles.triggerInner}>
            <span className={styles.avatarWrap} data-plan={user.plan}>
              <Avatar name={user.name} image={user.image} size="sm" />
            </span>
            <span className={styles.triggerName}>
              {user.name ?? user.email}
            </span>
          </div>
          <ChevronDown size={14} className={styles.triggerChevron} />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="end"
          sideOffset={8}
          className={styles.content}
        >
          <div className={styles.profile}>
            <span className={styles.profileAvatarWrap} data-plan={user.plan}>
              <Avatar name={user.name} image={user.image} size="lg" />
            </span>
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{user.name ?? 'User'}</p>

              <p className={styles.profileEmail}>{user.email}</p>
              <span className={styles.planBadge} data-plan={user.plan}>
                {isPro ? 'Pro' : 'Free'}
              </span>
            </div>
          </div>

          <DropdownMenuSeparator />

          <div className={styles.items}>
            <DropdownMenuItem
              className={styles.item}
              onClick={() => setIsSettingsOpen(true)}
            >
              <UserRound size={16} />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut({ callbackUrl: '/' })}
              className={[styles.item, styles.itemDestructive].join(' ')}
            >
              <LogOut size={16} />
              Log out
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserSettingsModal
        open={isSettingsOpen}
        user={user}
        onOpenChange={setIsSettingsOpen}
      />
    </>
  )
}
