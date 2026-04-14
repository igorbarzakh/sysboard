'use client'

import { useState } from 'react'
import { CreateBoardModal } from './CreateBoardModal'
import type { WorkspaceBoard } from '@/entities/workspace'
import { FREE_PLAN } from '@/shared/lib/constants'
import { Button } from '@/shared/ui/button'

interface CreateBoardButtonProps {
  workspaceSlug: string
  boardCount: number
  onSuccess: (board: WorkspaceBoard) => void
  limit?: number
}

export function CreateBoardButton({
  workspaceSlug,
  boardCount,
  onSuccess,
  limit = FREE_PLAN.maxBoardsPerWorkspace,
}: CreateBoardButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isAtLimit = boardCount >= limit

  return (
    <>
      <Button
        onClick={() => !isAtLimit && setIsOpen(true)}
        disabled={isAtLimit}
        title={isAtLimit ? 'Board limit reached' : 'Create a new board'}
      >
        New board
      </Button>

      <CreateBoardModal
        workspaceSlug={workspaceSlug}
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
