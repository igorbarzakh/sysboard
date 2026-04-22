'use client'

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { BOARD_NAME_MAX_LENGTH } from '../../model'
import type { Board } from '../../model'
import { BoardCardGrid } from '../BoardCardGrid/BoardCardGrid'
import { BoardCardList } from '../BoardCardList/BoardCardList'
import { DeleteBoardDialog } from '../DeleteBoardDialog/DeleteBoardDialog'

interface BoardCardProps {
  board: Board
  canManage: boolean
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => Promise<void>
  view?: 'grid' | 'list'
}

export function BoardCard({
  board,
  canManage,
  onDelete,
  onRename,
  view = 'grid',
}: BoardCardProps) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [draftName, setDraftName] = useState(board.name)
  const [isRenaming, setIsRenaming] = useState(false)
  const [isSavingName, setIsSavingName] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const commitPendingRef = useRef(false)

  const navigate = () => router.push(`/board/${board.id}`)

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isRenaming])

  function startRenaming() {
    if (!canManage) return
    setDraftName(board.name)
    setIsRenaming(true)
  }

  function handleDraftNameChange(event: ChangeEvent<HTMLInputElement>) {
    setDraftName(event.target.value)
  }

  function commitRename() {
    if (!isRenaming || commitPendingRef.current) return

    const nextName = draftName.trim()
    if (!nextName || nextName === board.name) {
      setDraftName(board.name)
      setIsRenaming(false)
      return
    }

    commitPendingRef.current = true
    setIsSavingName(true)
    setIsRenaming(false)

    void onRename(board.id, nextName)
      .catch(() => {
        setDraftName(board.name)
      })
      .finally(() => {
        commitPendingRef.current = false
        setIsSavingName(false)
      })
  }

  function handleRenameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    event.stopPropagation()

    if (event.key === 'Enter') {
      event.preventDefault()
      commitRename()
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setDraftName(board.name)
      setIsRenaming(false)
    }
  }

  return (
    <>
      {view === 'grid' ? (
        <BoardCardGrid
          board={board}
          canManage={canManage}
          draftName={draftName}
          inputRef={inputRef}
          isRenaming={isRenaming}
          isSavingName={isSavingName}
          onNavigate={navigate}
          onDeleteRequest={() => setConfirmOpen(true)}
          onRenameCommit={commitRename}
          onRenameDraftChange={handleDraftNameChange}
          onRenameKeyDown={handleRenameKeyDown}
          onRenameRequest={startRenaming}
          maxNameLength={BOARD_NAME_MAX_LENGTH}
        />
      ) : (
        <BoardCardList
          board={board}
          canManage={canManage}
          draftName={draftName}
          inputRef={inputRef}
          isRenaming={isRenaming}
          isSavingName={isSavingName}
          onNavigate={navigate}
          onDeleteRequest={() => setConfirmOpen(true)}
          onRenameCommit={commitRename}
          onRenameDraftChange={handleDraftNameChange}
          onRenameKeyDown={handleRenameKeyDown}
          onRenameRequest={startRenaming}
          maxNameLength={BOARD_NAME_MAX_LENGTH}
        />
      )}

      {canManage ? (
        <DeleteBoardDialog
          boardName={board.name}
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={() => onDelete(board.id)}
        />
      ) : null}
    </>
  )
}
