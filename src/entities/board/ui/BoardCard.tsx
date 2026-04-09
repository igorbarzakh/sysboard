'use client'

import { useRouter } from 'next/navigation'
import type { Board } from '../model/types'
import { Avatar } from '@/entities/user'

function formatRelativeTime(dateStr: string): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const diffMs = new Date(dateStr).getTime() - Date.now()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHr = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHr / 24)

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second')
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, 'hour')
  return rtf.format(diffDay, 'day')
}

interface BoardCardProps {
  board: Board
  currentUserId: string
  onDelete: (id: string) => void
}

export function BoardCard({ board, currentUserId, onDelete }: BoardCardProps) {
  const router = useRouter()
  const isOwner = board.ownerId === currentUserId

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    onDelete(board.id)
  }

  return (
    <article
      onClick={() => router.push(`/board/${board.id}`)}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--r-lg)',
        padding: 'var(--sp-4)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
        boxShadow: 'var(--shadow-node)',
        transition: 'box-shadow 150ms var(--ease-smooth)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-2)' }}>
        <h3
          style={{
            fontSize: 'var(--text-md)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {board.name}
        </h3>

        {isOwner && (
          <button
            onClick={handleDelete}
            aria-label="Delete board"
            style={{
              flexShrink: 0,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 'var(--text-sm)',
              padding: 'var(--sp-1)',
              borderRadius: 'var(--r-sm)',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
        <Avatar name={board.owner.name} image={board.owner.image} size="sm" />
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          {board.owner.name ?? 'Unknown'}
        </span>
      </div>

      <time
        dateTime={board.updatedAt}
        style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}
      >
        Updated {formatRelativeTime(board.updatedAt)}
      </time>
    </article>
  )
}
