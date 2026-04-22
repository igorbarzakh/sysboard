'use client'

import { useEffect } from 'react'
import { trackBoardView } from '../../api/boardApi'

interface BoardVisitTrackerProps {
  boardId: string
}

export function BoardVisitTracker({ boardId }: BoardVisitTrackerProps) {
  useEffect(() => {
    trackBoardView(boardId).catch(() => {})
  }, [boardId])

  return null
}
