'use client'

import { useState } from 'react'
import { CreateBoardModal } from './CreateBoardModal'
import type { Board } from '@/entities/board'
import { MAX_BOARDS_PER_USER } from '@/shared/lib/constants'

interface CreateBoardButtonProps {
  boardCount: number
  onSuccess: (board: Board) => void
}

export function CreateBoardButton({ boardCount, onSuccess }: CreateBoardButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isAtLimit = boardCount >= MAX_BOARDS_PER_USER

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isAtLimit}
        title={isAtLimit ? 'Board limit reached' : 'Create a new board'}
        style={{
          padding: 'var(--sp-2) var(--sp-4)',
          fontSize: 'var(--text-base)',
          fontWeight: 500,
          border: 'none',
          borderRadius: 'var(--r-md)',
          background: isAtLimit ? 'var(--bg-surface)' : 'var(--accent)',
          color: isAtLimit ? 'var(--text-muted)' : 'var(--text-on-accent)',
          cursor: isAtLimit ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-2)',
        }}
      >
        <span>New board</span>
        <span style={{ fontSize: 'var(--text-sm)', opacity: 0.75 }}>
          {boardCount}/{MAX_BOARDS_PER_USER}
        </span>
      </button>

      <CreateBoardModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={(board) => {
          setIsOpen(false)
          onSuccess(board)
        }}
      />
    </>
  )
}
