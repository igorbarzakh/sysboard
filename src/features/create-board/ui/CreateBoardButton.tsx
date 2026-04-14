'use client'

import { useState } from 'react'
import { CreateBoardModal } from './CreateBoardModal'
import type { Board } from '@/entities/board'
import { FREE_PLAN } from '@/shared/lib/constants'

interface CreateBoardButtonProps {
  boardCount: number
  onSuccess: (board: Board) => void
  limit?: number
}

export function CreateBoardButton({
  boardCount,
  onSuccess,
  limit = FREE_PLAN.maxBoardsPerWorkspace,
}: CreateBoardButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isAtLimit = boardCount >= limit

  return (
    <>
      <button
        onClick={() => !isAtLimit && setIsOpen(true)}
        disabled={isAtLimit}
        title={isAtLimit ? 'Board limit reached' : 'Create a new board'}
        className={`px-4 py-2 text-sm font-medium border-none rounded-md transition-opacity duration-150 ${
          isAtLimit
            ? 'bg-bg-surface text-text-muted cursor-not-allowed'
            : 'bg-accent text-text-on-accent cursor-pointer hover:opacity-85'
        }`}
      >
        New board
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
