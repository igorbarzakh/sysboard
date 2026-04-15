'use client'

import { Logo } from '@shared/ui'
import { UserMenu } from '../UserMenu/UserMenu'
import styles from './DashboardHeader.module.scss'

export function DashboardHeader() {
  return (
    <header className={styles.header}>
      <Logo />
      <div className={styles.spacer} />
      <div className={styles.actions}>
        <UserMenu />
      </div>
    </header>
  )
}
