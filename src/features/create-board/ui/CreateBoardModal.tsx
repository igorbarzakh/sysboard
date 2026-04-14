'use client'

import { useState } from 'react'
import { createWorkspaceBoard } from '@/entities/workspace'
import type { WorkspaceBoard } from '@/entities/workspace'
import { Button } from '@/shared/ui/button'

interface CreateBoardModalProps {
  workspaceSlug: string
  isOpen: boolean
  onClose: () => void
  onSuccess: (board: WorkspaceBoard) => void
}

export function CreateBoardModal({
  workspaceSlug,
  isOpen,
  onClose,
  onSuccess,
}: CreateBoardModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Name is required'); return }
    if (trimmed.length > 100) { setError('Name must be 100 characters or fewer'); return }

    setError(null)
    setIsLoading(true)
    try {
      const board = await createWorkspaceBoard(workspaceSlug, trimmed)
      setName('')
      onSuccess(board)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  function handleClose() {
    setName('')
    setError(null)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-board-title"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    >
      <div className="bg-bg-elevated border border-border-default rounded-xl shadow-elevated p-6 w-full max-w-100">
        <h2
          id="create-board-title"
          className="text-lg font-semibold mb-4"
        >
          New board
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            autoFocus
            type="text"
            placeholder="Board name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="w-full px-3 py-2 text-base border border-border-default rounded-md bg-bg-surface text-text-primary outline-none"
          />

          {error && (
            <p className="text-sm text-node-cdn">{error}</p>
          )}

          <div className="flex justify-end gap-2 mt-1">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
