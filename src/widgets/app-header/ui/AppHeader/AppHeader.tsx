'use client'

import { UserMenu } from '../UserMenu/UserMenu'
import styles from './AppHeader.module.scss'

export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.actions}>
        <UserMenu />
      </div>
    </header>
  )
}
