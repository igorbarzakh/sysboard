'use client'

import { useState } from 'react'
import { createWorkspaceBoard } from '@entities/workspace/api'
import type { WorkspaceBoard } from '@entities/workspace/model'
import { Button } from '@shared/ui'
import styles from './CreateBoardModal.module.scss'

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
      className={styles.backdrop}
    >
      <div className={styles.modal}>
        <h2 id="create-board-title" className={styles.title}>
          New board
        </h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            autoFocus
            type="text"
            placeholder="Board name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className={styles.input}
          />

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.footer}>
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
