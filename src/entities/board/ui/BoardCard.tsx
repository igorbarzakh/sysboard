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

function getBoardGradient(id: string): string {
  const hash = id.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0)
  const gradients = [
    'linear-gradient(135deg, rgba(66,99,235,0.12) 0%, rgba(121,80,242,0.12) 100%)',
    'linear-gradient(135deg, rgba(230,119,0,0.12) 0%, rgba(194,37,92,0.12) 100%)',
    'linear-gradient(135deg, rgba(47,158,68,0.12) 0%, rgba(66,99,235,0.12) 100%)',
    'linear-gradient(135deg, rgba(121,80,242,0.12) 0%, rgba(194,37,92,0.12) 100%)',
    'linear-gradient(135deg, rgba(92,124,250,0.12) 0%, rgba(47,158,68,0.12) 100%)',
  ]
  return gradients[Math.abs(hash) % gradients.length]
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
    <>
      <style href="sdb-board-card" precedence="component">{`
        .sdb-board-card {
          transition: box-shadow 150ms var(--ease-smooth), transform 150ms var(--ease-smooth);
          cursor: pointer;
        }
        .sdb-board-card:hover {
          box-shadow: var(--shadow-elevated);
          transform: translateY(-2px);
        }
        .sdb-delete-btn {
          opacity: 0;
          transition: opacity 100ms;
          pointer-events: none;
        }
        .sdb-board-card:hover .sdb-delete-btn {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>

      <article
        className="sdb-board-card"
        onClick={() => router.push(`/board/${board.id}`)}
        style={{
          width: 280,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-node)',
          fontFamily: 'var(--font-body)',
        }}
      >
        {/* Preview */}
        <div
          style={{
            aspectRatio: '16 / 9',
            background: getBoardGradient(board.id),
            borderBottom: '1px solid var(--border-faint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ opacity: 0.3 }}
          >
            <rect x="2" y="2" width="12" height="8" rx="2" fill="currentColor" />
            <rect x="18" y="2" width="12" height="8" rx="2" fill="currentColor" />
            <rect x="10" y="22" width="12" height="8" rx="2" fill="currentColor" />
            <line x1="8" y1="10" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" />
            <line x1="24" y1="10" x2="24" y2="16" stroke="currentColor" strokeWidth="1.5" />
            <line x1="8" y1="16" x2="16" y2="22" stroke="currentColor" strokeWidth="1.5" />
            <line x1="24" y1="16" x2="16" y2="22" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Content */}
        <div
          style={{
            padding: 'var(--sp-3) var(--sp-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-2)',
          }}
        >
          {/* Name row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--sp-2)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-md)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0,
              }}
            >
              {board.name}
            </h3>

            {isOwner && (
              <button
                className="sdb-delete-btn"
                onClick={handleDelete}
                aria-label="Delete board"
                style={{
                  flexShrink: 0,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 'var(--sp-1)',
                  borderRadius: 'var(--r-sm)',
                  lineHeight: 1,
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5.833 6.5v4M8.167 6.5v4M3.5 3.5l.667 8h5.666l.667-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Owner + time */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--sp-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <Avatar name={board.owner.name} image={board.owner.image} size="sm" />
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 120,
                }}
              >
                {board.owner.name ?? 'Unknown'}
              </span>
            </div>

            <time
              dateTime={board.updatedAt}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)',
                flexShrink: 0,
              }}
            >
              {formatRelativeTime(board.updatedAt)}
            </time>
          </div>
        </div>
      </article>
    </>
  )
}
