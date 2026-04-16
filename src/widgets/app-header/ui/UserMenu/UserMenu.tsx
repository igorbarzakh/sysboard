'use client'

import { signOut } from 'next-auth/react'
import { ChevronDown, Settings, LogOut } from 'lucide-react'
import { useCurrentUser } from '@entities/user/hooks'
import { Avatar } from '@entities/user/ui'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@shared/ui'
import styles from './UserMenu.module.scss'

export function UserMenu() {
  const user = useCurrentUser()

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={styles.trigger}>
        <div className={styles.triggerInner}>
          <Avatar name={user.name} image={user.image} size="sm" />
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
        className={styles.content}>
        <div className={styles.profile}>
          <Avatar name={user.name} image={user.image} size="lg" />
          <div className={styles.profileInfo}>
            <p className={styles.profileName}>{user.name ?? 'User'}</p>
            <p className={styles.profileEmail}>{user.email}</p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <div className={styles.items}>
          <DropdownMenuItem className={styles.item}>
            <Settings size={16} />
            Settings
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOut({ callbackUrl: '/' })}
            className={[styles.item, styles.itemDestructive].join(' ')}>
            <LogOut size={16} />
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
