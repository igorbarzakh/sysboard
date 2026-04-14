'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronDown, Check, Plus } from 'lucide-react'
import { getWorkspaces } from '@/entities/workspace'
import type { Workspace } from '@/entities/workspace'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu'

export function WorkspaceSwitcher() {
  const params = useParams()
  const router = useRouter()
  const currentSlug = typeof params?.slug === 'string' ? params.slug : null

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWorkspaces()
      .then(setWorkspaces)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const current = workspaces.find((w) => w.slug === currentSlug) ?? null

  if (loading) {
    return (
      <div className="w-full h-[32px] rounded-lg bg-bg-surface animate-pulse" />
    )
  }

  if (!current && workspaces.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 px-2 py-1.5 bg-transparent border-none cursor-pointer rounded-lg transition-all duration-250 ease-in-out hover:bg-bg-surface outline-none">
        <span className="text-[13px] font-medium text-text-primary max-w-40 truncate">
          {current?.name ?? 'Select workspace'}
        </span>
        <ChevronDown size={13} className="text-text-primary shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="w-56 rounded-[10px] bg-bg-elevated border border-border-default p-1"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
      >
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => router.push(`/w/${workspace.slug}`)}
            className={`flex items-center gap-2.5 px-[10px] py-2 text-[13px] text-text-primary rounded-[7px] ${
              workspace.slug === currentSlug
                ? 'cursor-default pointer-events-none'
                : 'cursor-pointer hover:bg-bg-surface focus:bg-bg-surface'
            }`}
          >
            <div className="w-5 h-5 rounded-sm bg-bg-surface border border-border-subtle flex items-center justify-center text-[10px] font-bold text-text-primary shrink-0">
              {workspace.name.slice(0, 1).toUpperCase()}
            </div>
            <span className="flex-1 truncate">{workspace.name}</span>
            {workspace.slug === currentSlug && (
              <Check size={14} className="text-text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="my-1 bg-border-subtle" />

        <DropdownMenuItem
          onClick={() => router.push('/workspaces/new')}
          className="flex items-center gap-2.5 px-[10px] py-2 text-[13px] text-text-secondary rounded-[7px] cursor-pointer hover:bg-bg-surface focus:bg-bg-surface"
        >
          <Plus size={14} className="shrink-0" />
          Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
