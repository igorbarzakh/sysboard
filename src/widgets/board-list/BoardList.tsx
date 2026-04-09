'use client'

import { useEffect, useState } from 'react'
import { getBoards, BoardCard } from '@/entities/board'
import type { Board } from '@/entities/board'
import { useCurrentUser } from '@/entities/user'
import { CreateBoardButton } from '@/features/create-board'
import { useDeleteBoard } from '@/features/delete-board'

function SkeletonCard() {
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--r-lg)',
        padding: 'var(--sp-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
      }}
    >
      <div style={{ height: 18, width: '60%', background: 'var(--bg-surface)', borderRadius: 'var(--r-sm)' }} />
      <div style={{ height: 14, width: '40%', background: 'var(--bg-surface)', borderRadius: 'var(--r-sm)' }} />
      <div style={{ height: 12, width: '30%', background: 'var(--bg-surface)', borderRadius: 'var(--r-sm)' }} />
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
      // revert on failure
      getBoards().then(setBoards)
    }
  }

  function handleCreated(board: Board) {
    setBoards((prev) => [board, ...prev])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-primary)' }}>
          My boards
        </h1>
        <CreateBoardButton boardCount={boards.length} onSuccess={handleCreated} />
      </div>

      {isLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 'var(--sp-4)',
          }}
        >
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : boards.length === 0 ? (
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)' }}>No boards yet</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 'var(--sp-4)',
          }}
        >
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
  )
}
