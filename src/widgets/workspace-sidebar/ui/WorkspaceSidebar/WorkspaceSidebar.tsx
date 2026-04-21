'use client'

import type { Workspace } from '@entities/workspace/model'
import { WorkspaceSwitcher } from '@widgets/workspace-switcher/ui'
import { Logo } from '@shared/ui'
import { WorkspaceNav } from '../WorkspaceNav/WorkspaceNav'
import styles from './WorkspaceSidebar.module.scss'

interface WorkspaceSidebarProps {
  workspace: Workspace
}

export function WorkspaceSidebar({ workspace }: WorkspaceSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Logo />
      </div>

      <div className={styles.switcher}>
        <WorkspaceSwitcher />
      </div>

      <WorkspaceNav workspace={workspace} />
    </aside>
  )
}
