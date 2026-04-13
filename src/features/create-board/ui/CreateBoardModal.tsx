'use client'

import { useState } from 'react'
import { createBoard } from '@/entities/board'
import type { Board } from '@/entities/board'

interface CreateBoardModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (board: Board) => void
}

export function CreateBoardModal({ isOpen, onClose, onSuccess }: CreateBoardModalProps) {
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
      const board = await createBoard(trimmed)
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
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-base border border-border-default rounded-md bg-transparent text-text-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-base border-none rounded-md text-text-on-accent font-medium ${isLoading ? 'bg-accent-dim cursor-not-allowed' : 'bg-accent cursor-pointer'}`}
            >
              {isLoading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
