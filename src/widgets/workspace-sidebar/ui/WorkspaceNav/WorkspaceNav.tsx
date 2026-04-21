'use client'

import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { LayoutGrid, Settings, Users } from 'lucide-react'
import type { Workspace } from '@entities/workspace/model'
import styles from './WorkspaceNav.module.scss'

interface WorkspaceNavProps {
  workspace: Workspace
}

interface NavItem {
  badge?: number
  href: string
  icon: ReactNode
  label: string
}

export function WorkspaceNav({ workspace }: WorkspaceNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems: NavItem[] = [
    {
      href: `/workspace/${workspace.slug}`,
      icon: <LayoutGrid size={18} />,
      label: 'Boards',
    },
    {
      badge: workspace.members.length,
      href: `/workspace/${workspace.slug}/members`,
      icon: <Users size={18} />,
      label: 'Members',
    },
    {
      href: `/workspace/${workspace.slug}/settings`,
      icon: <Settings size={18} />,
      label: 'Settings',
    },
  ]

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => (
        <WorkspaceNavButton
          key={item.href}
          item={item}
          isActive={pathname === item.href}
          onNavigate={router.push}
        />
      ))}
    </nav>
  )
}

interface WorkspaceNavButtonProps {
  isActive: boolean
  item: NavItem
  onNavigate: (href: string) => void
}

function WorkspaceNavButton({
  isActive,
  item,
  onNavigate,
}: WorkspaceNavButtonProps) {
  return (
    <button
      onClick={() => {
        if (!isActive) {
          onNavigate(item.href)
        }
      }}
      className={styles.button}
      data-active={isActive ? 'true' : undefined}
    >
      <span className={styles.icon}>{item.icon}</span>
      <span className={styles.label}>{item.label}</span>
      {item.badge !== undefined && (
        <span className={styles.badge}>{item.badge}</span>
      )}
    </button>
  )
}
