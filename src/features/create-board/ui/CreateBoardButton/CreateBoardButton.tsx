'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createBoard } from '@entities/board/api'
import { boardQueryKeys } from '@entities/board/model'
import { FREE_PLAN } from '@shared/lib'
import { Button } from '@shared/ui'

interface CreateBoardButtonProps {
  boardCount: number
  currentUserId: string
  limit?: number
  workspaceSlug: string
}

let tldrawPreloadPromise: Promise<unknown> | null = null

function preloadBoardEditor() {
  if (!tldrawPreloadPromise) {
    tldrawPreloadPromise = import('tldraw')
  }

  return tldrawPreloadPromise
}

export function CreateBoardButton({
  boardCount,
  currentUserId,
  limit = FREE_PLAN.maxBoardsPerWorkspace,
  workspaceSlug,
}: CreateBoardButtonProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const isAtLimit = boardCount >= limit

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void preloadBoardEditor()
    }, 250)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  async function handleClick() {
    if (isAtLimit || isCreating) return

    setIsCreating(true)

    try {
      void preloadBoardEditor()
      const board = await createBoard(workspaceSlug, 'Untitled board')
      queryClient.setQueryData(
        boardQueryKeys.detail(board.id, currentUserId),
        board,
      )
      router.push(`/board/${board.id}`)
    } catch {
      setIsCreating(false)
      toast.error('Failed to create board')
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isAtLimit || isCreating}
      title={isAtLimit ? 'Board limit reached' : 'Create a new board'}
      onMouseEnter={() => {
        void preloadBoardEditor()
      }}
      onFocus={() => {
        void preloadBoardEditor()
      }}
    >
      <Plus size={16} />
      New board
    </Button>
  )
}
