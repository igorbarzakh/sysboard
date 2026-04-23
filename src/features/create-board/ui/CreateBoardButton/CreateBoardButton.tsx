'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { FREE_PLAN } from '@shared/lib'
import { Button } from '@shared/ui'

interface CreateBoardButtonProps {
  boardCount: number
  limit?: number
  workspaceSlug: string
}

export function CreateBoardButton({
  boardCount,
  limit = FREE_PLAN.maxBoardsPerWorkspace,
  workspaceSlug,
}: CreateBoardButtonProps) {
  const router = useRouter()
  const isAtLimit = boardCount >= limit

  function handleClick() {
    if (isAtLimit) return
    router.push(`/board/new?workspace=${workspaceSlug}`)
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isAtLimit}
      title={isAtLimit ? 'Board limit reached' : 'Create a new board'}
    >
      <Plus size={16} />
      New board
    </Button>
  )
}
