'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, Users, Settings, Zap, Sparkles, ArrowRight, X } from 'lucide-react'
import type { Workspace } from '@/entities/workspace'
import { WorkspaceSwitcher } from '@/widgets/workspace-switcher'
import { PLAN_LIMITS } from '@/shared/lib/constants'
import { Button } from '@/shared/ui/button'
import { useRecentBoards } from '@/entities/board'

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
        className={`w-full flex items-center gap-3 px-2.5 py-2 text-sm rounded-lg transition-all duration-250 ease-in-out text-left text-text-primary ${
          isActive
            ? 'bg-accent-dim text-text-accent font-medium cursor-default'
            : 'bg-transparent font-normal cursor-pointer hover:bg-bg-surface-hover'
        }`}
      >
        <span className="text-text-primary">
          {item.icon}
        </span>
        <span className="flex-1">{item.label}</span>
        {item.badge !== undefined && (
          <span className="text-[11px] font-medium tabular-nums px-1.5 py-0.5 rounded-md bg-bg-surface-hover text-text-secondary">
            {item.badge}
          </span>
        )}
      </button>
    )
  }

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-full bg-bg-canvas border-r border-border-subtle p-3 gap-1">
      <div className="[&_button]:w-full mb-4">
        <WorkspaceSwitcher />
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => <NavButton key={item.href} item={item} />)}
      </nav>

      {recentBoards.length > 0 && (
        <div className="mt-4 flex flex-col gap-1">
          <p className="text-[11px] text-text-muted px-2.5 mb-0.5 select-none uppercase tracking-wide">Recent</p>
          {recentBoards.map((board) => (
            <div
              key={board.id}
              onClick={() => router.push(`/board/${board.id}`)}
              className="group flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-lg transition-all duration-250 ease-in-out cursor-pointer text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
            >
              <LayoutGrid size={14} className="shrink-0" />
              <span className="truncate flex-1">{board.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeRecentBoard(board.id) }}
                className="shrink-0 p-0.5 rounded-md text-text-muted opacity-0 group-hover:opacity-100 hover:bg-bg-surface-hover hover:text-text-primary transition-all duration-250 ease-in-out cursor-pointer border-none bg-transparent"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto pt-3">
        {workspace.plan === 'pro' ? (
          <div className="rounded-xl bg-accent-dim border border-accent-bright/20 px-3 py-3 select-none">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-text-accent tracking-wide">Pro plan</span>
              <Sparkles size={13} className="text-text-accent" />
            </div>
            <p className="text-[11px] text-text-accent/70 leading-snug">
              {PLAN_LIMITS.pro.maxBoardsPerWorkspace} boards · {PLAN_LIMITS.pro.maxMembersPerBoard} members per board
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-bg-elevated border border-border-default px-3 py-3 select-none">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-text-secondary tracking-wide">Free plan</span>
              <Zap size={13} className="text-text-muted" />
            </div>
            <p className="text-[11px] text-text-muted leading-snug mb-2.5">
              {PLAN_LIMITS.free.maxBoardsPerWorkspace} boards · {PLAN_LIMITS.free.maxMembersPerBoard} members per board
            </p>
            <Button size="xs" className="w-full">
              Upgrade to Pro
              <ArrowRight size={11} />
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}
