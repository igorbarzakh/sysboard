'use client'

import { useEffect, useState } from 'react'
import { getBoards, BoardCard } from '@/entities/board'
import type { Board } from '@/entities/board'
import { useCurrentUser } from '@/entities/user'
import { CreateBoardButton } from '@/features/create-board'
import { useDeleteBoard } from '@/features/delete-board'

const GRID_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 'var(--sp-5)',
}

function SkeletonCard() {
  return (
    <div
      style={{
        width: 280,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-node)',
      }}
    >
      <div
        className="sdb-skeleton"
        style={{
          aspectRatio: '16 / 9',
          background: 'var(--bg-surface)',
        }}
      />
      <div
        style={{
          padding: 'var(--sp-3) var(--sp-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-3)',
        }}
      >
        <div
          className="sdb-skeleton"
          style={{ height: 16, width: '65%', background: 'var(--bg-surface)', borderRadius: 'var(--r-sm)' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <div
            className="sdb-skeleton"
            style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-surface)', flexShrink: 0 }}
          />
          <div
            className="sdb-skeleton"
            style={{ height: 12, width: '40%', background: 'var(--bg-surface)', borderRadius: 'var(--r-sm)' }}
          />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ boardCount, onCreated }: { boardCount: number; onCreated: (b: Board) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--sp-5)',
        padding: 'var(--sp-12) var(--sp-6)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--r-lg)',
          background: 'var(--accent-dim)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="2" y="2" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="16" y="2" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="9" y="19" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 9v4.5M21 9v4.5M7 13.5C7 13.5 14 18 21 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 13.5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-md)',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          No boards yet
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
          }}
        >
          Create your first board to start designing
        </p>
      </div>

      <CreateBoardButton boardCount={boardCount} onSuccess={onCreated} />
    </div>
  )
}

export function BoardList() {
  const [boards, setBoards] = useState<Board[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const user = useCurrentUser()
  const { deleteBoard } = useDeleteBoard()

  useEffect(() => {
    getBoards()
      .then(setBoards)
      .finally(() => setIsLoading(false))
  }, [])

  async function handleDelete(id: string) {
    setBoards((prev) => prev.filter((b) => b.id !== id))
    try {
      await deleteBoard(id)
    } catch {
      getBoards().then(setBoards)
    }
  }

  function handleCreated(board: Board) {
    setBoards((prev) => [board, ...prev])
  }

  return (
    <>
      <style href="sdb-skeleton" precedence="component">{`
        @keyframes sdb-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .sdb-skeleton {
          animation: sdb-pulse 1.6s ease-in-out infinite;
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-6)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xl)',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            My boards
          </h1>
          {!isLoading && boards.length > 0 && (
            <CreateBoardButton boardCount={boards.length} onSuccess={handleCreated} />
          )}
        </div>

        {isLoading ? (
          <div style={GRID_STYLE}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : boards.length === 0 ? (
          <EmptyState boardCount={0} onCreated={handleCreated} />
        ) : (
          <div style={GRID_STYLE}>
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                currentUserId={user?.id ?? ''}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
