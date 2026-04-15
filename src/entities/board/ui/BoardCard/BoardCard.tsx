'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Board } from '../../model'
import { BoardCardGrid } from '../BoardCardGrid/BoardCardGrid'
import { BoardCardList } from '../BoardCardList/BoardCardList'
import { DeleteBoardDialog } from '../DeleteBoardDialog/DeleteBoardDialog'

interface BoardCardProps {
  board: Board
  onDelete: (id: string) => void
  view?: 'grid' | 'list'
}

export function BoardCard({ board, onDelete, view = 'grid' }: BoardCardProps) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const navigate = () => router.push(`/board/${board.id}`)

  return (
    <>
      {view === 'grid' ? (
        <BoardCardGrid board={board} onNavigate={navigate} onDeleteRequest={() => setConfirmOpen(true)} />
      ) : (
        <BoardCardList board={board} onNavigate={navigate} onDeleteRequest={() => setConfirmOpen(true)} />
      )}

      <DeleteBoardDialog
        boardName={board.name}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => onDelete(board.id)}
      />
    </>
  )
}
