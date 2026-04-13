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
        className={`px-4 py-2 text-base font-medium border-none rounded-md flex items-center gap-2 ${
          isAtLimit
            ? 'bg-bg-surface text-text-muted cursor-not-allowed'
            : 'bg-accent text-text-on-accent cursor-pointer'
        }`}
      >
        <span>New board</span>
        <span className="text-sm opacity-75">
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
