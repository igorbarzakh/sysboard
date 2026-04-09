'use client'

import { useState } from 'react'
import { deleteBoard as deleteBoardApi } from '@/entities/board'

interface UseDeleteBoardResult {
  deleteBoard: (id: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

export function useDeleteBoard(): UseDeleteBoardResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function deleteBoard(id: string): Promise<void> {
    setError(null)
    setIsLoading(true)
    try {
      await deleteBoardApi(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete board')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { deleteBoard, isLoading, error }
}
