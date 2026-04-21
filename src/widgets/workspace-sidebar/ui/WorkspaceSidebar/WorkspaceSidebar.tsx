'use client'

import type { Workspace } from '@entities/workspace/model'
import { useCurrentUser } from '@entities/user/hooks'
import { WorkspaceSwitcher } from '@widgets/workspace-switcher/ui'
import { Logo } from '@shared/ui'
import { PlanBanner } from '../PlanBanner/PlanBanner'
import { RecentBoards } from '../RecentBoards/RecentBoards'
import { WorkspaceNav } from '../WorkspaceNav/WorkspaceNav'
import styles from './WorkspaceSidebar.module.scss'

interface WorkspaceSidebarProps {
  workspace: Workspace
}

export function WorkspaceSidebar({ workspace }: WorkspaceSidebarProps) {
  const user = useCurrentUser()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Logo />
      </div>

      <div className={styles.switcher}>
        <WorkspaceSwitcher />
      </div>

      <WorkspaceNav workspace={workspace} />
      <RecentBoards />
      <PlanBanner plan={user?.plan ?? 'free'} />
    </aside>
  )
}
