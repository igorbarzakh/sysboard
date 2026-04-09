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
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-elevated)',
          padding: 'var(--sp-6)',
          width: '100%',
          maxWidth: 400,
        }}
      >
        <h2
          id="create-board-title"
          style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--sp-4)' }}
        >
          New board
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <input
            autoFocus
            type="text"
            placeholder="Board name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            style={{
              width: '100%',
              padding: 'var(--sp-2) var(--sp-3)',
              fontSize: 'var(--text-base)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--r-md)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />

          {error && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--node-cdn)' }}>{error}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-2)', marginTop: 'var(--sp-1)' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: 'var(--sp-2) var(--sp-4)',
                fontSize: 'var(--text-base)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--r-md)',
                background: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: 'var(--sp-2) var(--sp-4)',
                fontSize: 'var(--text-base)',
                border: 'none',
                borderRadius: 'var(--r-md)',
                background: isLoading ? 'var(--accent-dim)' : 'var(--accent)',
                color: 'var(--text-on-accent)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: 500,
              }}
            >
              {isLoading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
