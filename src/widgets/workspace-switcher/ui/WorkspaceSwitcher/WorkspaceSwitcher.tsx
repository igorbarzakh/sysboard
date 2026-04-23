'use client'

import { useParams, useRouter } from 'next/navigation'
import { ChevronDown, Check, Plus } from 'lucide-react'
import { useWorkspacesQuery } from '@entities/workspace/hooks'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Skeleton,
} from '@shared/ui'
import styles from './WorkspaceSwitcher.module.scss'

export function WorkspaceSwitcher() {
  const params = useParams()
  const router = useRouter()
  const currentSlug = typeof params?.slug === 'string' ? params.slug : null
  const { data: workspaces = [], isPending } = useWorkspacesQuery()

  const current = workspaces.find((w) => w.slug === currentSlug) ?? null

  if (isPending) {
    return <Skeleton className={styles.skeleton} />
  }

  if (!current && workspaces.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={styles.trigger}>
        <span className={styles.triggerName}>
          {current?.name ?? 'Select workspace'}
        </span>
        <ChevronDown size={13} className={styles.triggerChevron} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={6}
        className={styles.content}
      >
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => router.push(`/workspace/${workspace.slug}`)}
            className={styles.item}
            data-active={workspace.slug === currentSlug ? 'true' : undefined}
          >
            <div className={styles.itemIcon}>
              {workspace.name.slice(0, 1).toUpperCase()}
            </div>
            <span className={styles.itemName}>{workspace.name}</span>
            {workspace.slug === currentSlug && (
              <Check size={14} className={styles.itemCheck} />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push('/workspaces/new')}
          className={styles.createItem}
        >
          <Plus size={14} />
          Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
