'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, Users, Settings, Zap, Sparkles, ArrowRight, X } from 'lucide-react'
import type { Workspace } from '@entities/workspace/model'
import { WorkspaceSwitcher } from '@widgets/workspace-switcher/ui'
import { PLAN_LIMITS } from '@shared/lib'
import { Button } from '@shared/ui'
import { useRecentBoards } from '@entities/board/hooks'
import styles from './WorkspaceSidebar.module.scss'

interface WorkspaceSidebarProps {
  workspace: Workspace
  canCreateWorkspace: boolean
}

interface NavItem {
  label: string
  icon: React.ReactNode
  href: string
  badge?: number
}

export function WorkspaceSidebar({ workspace }: WorkspaceSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { recentBoards, removeRecentBoard } = useRecentBoards()

  const navItems: NavItem[] = [
    { label: 'Boards', icon: <LayoutGrid size={18} />, href: `/w/${workspace.slug}` },
    { label: 'Members', icon: <Users size={18} />, href: `/w/${workspace.slug}/members`, badge: workspace.members.length },
    { label: 'Settings', icon: <Settings size={18} />, href: `/w/${workspace.slug}/settings` },
  ]

  function NavButton({ item }: { item: NavItem }) {
    const isActive = pathname === item.href
    return (
      <button
        onClick={() => !isActive && router.push(item.href)}
        className={styles.navBtn}
        data-active={isActive ? 'true' : undefined}
      >
        <span className={styles.navBtnIcon}>{item.icon}</span>
        <span className={styles.navBtnLabel}>{item.label}</span>
        {item.badge !== undefined && (
          <span className={styles.navBtnBadge}>{item.badge}</span>
        )}
      </button>
    )
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.switcher}>
        <WorkspaceSwitcher />
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => <NavButton key={item.href} item={item} />)}
      </nav>

      {recentBoards.length > 0 && (
        <div className={styles.recent}>
          <p className={styles.recentLabel}>Recent</p>
          {recentBoards.map((board) => (
            <div
              key={board.id}
              onClick={() => router.push(`/board/${board.id}`)}
              className={styles.recentItem}
            >
              <LayoutGrid size={14} className={styles.recentIcon} />
              <span className={styles.recentName}>{board.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeRecentBoard(board.id) }}
                className={styles.recentRemove}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.planBanner}>
        {workspace.plan === 'pro' ? (
          <div className={styles.planCard} data-plan="pro">
            <div className={styles.planHeader}>
              <span className={styles.planName}>Pro plan</span>
              <Sparkles size={13} className={styles.planIcon} />
            </div>
            <p className={styles.planDetails}>
              {PLAN_LIMITS.pro.maxBoardsPerWorkspace} boards · {PLAN_LIMITS.pro.maxMembersPerBoard} members per board
            </p>
          </div>
        ) : (
          <div className={styles.planCard} data-plan="free">
            <div className={styles.planHeader}>
              <span className={styles.planName}>Free plan</span>
              <Zap size={13} className={styles.planIcon} />
            </div>
            <p className={styles.planDetails}>
              {PLAN_LIMITS.free.maxBoardsPerWorkspace} boards · {PLAN_LIMITS.free.maxMembersPerBoard} members per board
            </p>
            <Button size="xs" className={styles.upgradeBtn}>
              Upgrade to Pro
              <ArrowRight size={11} />
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}
