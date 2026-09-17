'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Box, Tldraw, type Editor, type TLShapeId, type TLStoreSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import { updateBoard, uploadBoardPreview } from '@entities/board/api'
import { normalizeBoardPreview } from '@entities/board/lib'
import { boardQueryKeys, type Board } from '@entities/board/model'
import { BoardNamePanel } from '../BoardNamePanel/BoardNamePanel'

interface TldrawCanvasProps {
  board: Board
  currentUserId: string
}

const SAVE_DELAY_MS = 1000
const PREVIEW_IDLE_DELAY_MS = 60_000
const KEEPALIVE_MAX_BYTES = 60 * 1024
const PREVIEW_ASPECT_RATIO = 16 / 9
const PREVIEW_PADDING = 64

function getPreviewBounds(editor: Editor, shapeIds: TLShapeId[]) {
  const contentBounds = editor.getShapesPageBounds(shapeIds)
  if (!contentBounds) return undefined

  let width = contentBounds.w + PREVIEW_PADDING * 2
  let height = contentBounds.h + PREVIEW_PADDING * 2

  if (width / height > PREVIEW_ASPECT_RATIO) {
    height = width / PREVIEW_ASPECT_RATIO
  } else {
    width = height * PREVIEW_ASPECT_RATIO
  }

  return new Box(
    contentBounds.midX - width / 2,
    contentBounds.midY - height / 2,
    width,
    height,
  )
}

export function TldrawCanvas({ board, currentUserId }: TldrawCanvasProps) {
  const queryClient = useQueryClient()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveQueue = useRef<Promise<void>>(Promise.resolve())
  const previewPromise = useRef<Promise<void> | null>(null)
  const latestVersion = useRef(board.dataVersion)
  const changeSequence = useRef(0)
  const dirty = useRef(board.previewVersion < board.dataVersion)
  const cleanupMount = useRef<(() => void) | null>(null)

  const updatePreviewCache = useCallback(
    (previewUrl: string | null, previewVersion: number) => {
      queryClient.setQueryData<Board>(
        boardQueryKeys.detail(board.id, currentUserId),
        (current) => current
          ? { ...current, previewUrl, previewVersion }
          : current,
      )
      queryClient.setQueryData<Board[]>(
        boardQueryKeys.workspaceBoards(board.workspace.slug, currentUserId),
        (boards) => boards?.map((item) =>
          item.id === board.id
            ? { ...item, data: null, previewUrl, previewVersion }
            : item,
        ),
      )
    },
    [board.id, board.workspace.slug, currentUserId, queryClient],
  )

  const persistSnapshot = useCallback((editor: Editor, sequence: number) => {
    const snapshot = editor.getSnapshot()
    const pendingSave = saveQueue.current
      .catch(() => {})
      .then(async () => {
        const updated = await updateBoard(board.id, { data: snapshot })
        latestVersion.current = updated.dataVersion
        if (sequence === changeSequence.current) {
          queryClient.setQueryData<Board>(
            boardQueryKeys.detail(board.id, currentUserId),
            (current) => current
              ? { ...current, data: snapshot, dataVersion: updated.dataVersion }
              : current,
          )
        }
      })

    saveQueue.current = pendingSave
    return pendingSave
  }, [board.id, currentUserId, queryClient])

  const flushPreview = useCallback((editor: Editor): Promise<void> => {
    if (!dirty.current) return Promise.resolve()
    if (previewPromise.current) return previewPromise.current

    const pendingPreview = (async () => {
      while (dirty.current) {
        const sequence = changeSequence.current
        const shapeIds = [...editor.getCurrentPageShapeIds()]
        const previewBlobPromise = shapeIds.length > 0
          ? editor.toImage(shapeIds, {
              format: 'png',
              background: true,
              bounds: getPreviewBounds(editor, shapeIds),
              padding: 0,
              darkMode: false,
              pixelRatio: 1,
            }).then(({ blob }) => normalizeBoardPreview(blob))
          : Promise.resolve(null)

        let savePromise: Promise<void>
        if (saveTimer.current) {
          clearTimeout(saveTimer.current)
          saveTimer.current = null
          savePromise = persistSnapshot(editor, sequence)
        } else {
          savePromise = saveQueue.current.catch(() => {})
        }

        const [, blob] = await Promise.all([savePromise, previewBlobPromise])

        if (sequence !== changeSequence.current) continue

        const keepalive = document.visibilityState === 'hidden'
          && (!blob || blob.size <= KEEPALIVE_MAX_BYTES)
        const result = await uploadBoardPreview(
          board.id,
          latestVersion.current,
          blob,
          keepalive,
        )

        updatePreviewCache(result.previewUrl, result.previewVersion)
        if (sequence === changeSequence.current) dirty.current = false
      }
    })()
      .catch(() => {})
      .finally(() => {
        previewPromise.current = null
      })

    previewPromise.current = pendingPreview
    return pendingPreview
  }, [board.id, persistSnapshot, updatePreviewCache])

  const handleMount = useCallback(
    (editor: Editor) => {
      cleanupMount.current?.()

      if (board.data && typeof board.data === 'object') {
        try {
          editor.loadSnapshot(board.data as TLStoreSnapshot)
        } catch {
        }
      }

      const unlisten = editor.store.listen(
        () => {
          if (saveTimer.current) clearTimeout(saveTimer.current)
          if (previewTimer.current) clearTimeout(previewTimer.current)

          dirty.current = true
          changeSequence.current += 1
          const sequence = changeSequence.current

          saveTimer.current = setTimeout(() => {
            saveTimer.current = null
            void persistSnapshot(editor, sequence)
          }, SAVE_DELAY_MS)

          previewTimer.current = setTimeout(() => {
            previewTimer.current = null
            void flushPreview(editor)
          }, PREVIEW_IDLE_DELAY_MS)
        },
        { scope: 'document', source: 'user' },
      )

      if (dirty.current) {
        previewTimer.current = setTimeout(() => {
          previewTimer.current = null
          void flushPreview(editor)
        }, PREVIEW_IDLE_DELAY_MS)
      }

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') void flushPreview(editor)
      }
      const handlePageHide = () => void flushPreview(editor)
      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('pagehide', handlePageHide)

      cleanupMount.current = () => {
        if (dirty.current) void flushPreview(editor)
        unlisten()
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('pagehide', handlePageHide)
      }
    },
    [board.data, flushPreview, persistSnapshot],
  )

  useEffect(() => {
    return () => {
      cleanupMount.current?.()
      if (saveTimer.current) clearTimeout(saveTimer.current)
      if (previewTimer.current) clearTimeout(previewTimer.current)
    }
  }, [])

  return (
    <Tldraw
      onMount={handleMount}
      components={{
        SharePanel: () => <BoardNamePanel name={board.name} />,
      }}
    />
  )
}
