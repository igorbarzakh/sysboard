'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { LiveMap, type JsonObject } from '@liveblocks/client'
import { useRoom } from '@liveblocks/react'
import { useQueryClient } from '@tanstack/react-query'
import { Box, HighlightShapeUtil, Tldraw, type Editor, type TLShapeId, type TLUiOverrides } from 'tldraw'
import 'tldraw/tldraw.css'
import {
  BoardPreviewStaleError,
  BoardVersionConflictError,
  getBoard,
  saveBoardSnapshot,
  uploadBoardPreview,
} from '@entities/board/api'
import { normalizeBoardPreview } from '@entities/board/lib'
import { boardQueryKeys, type Board } from '@entities/board/model'
import { connectDocumentSync } from '../../lib/documentSync'
import { canvasFontUrls } from '../../lib/canvasFonts'
import { BOARD_IDLE_TIMEOUT_MS } from '../../lib/idleTimer'
import { connectPresence } from '../../lib/presenceSync'
import { hasSameDocument } from '../../lib/sameDocument'
import { PlaceholderTextShapeUtil } from '../../lib/PlaceholderTextShapeUtil'
import { BoardBackground } from '../BoardBackground/BoardBackground'
import { BoardNamePanel } from '../BoardNamePanel/BoardNamePanel'
import { BoardToolbar } from '../BoardToolbar/BoardToolbar'
import { BoardTextToolbar } from '../BoardTextToolbar/BoardTextToolbar'
import { CollaboratorCursor } from '../CollaboratorCursor/CollaboratorCursor'
import { RemoteSelections } from '../RemoteSelections/RemoteSelections'
import { SelectionForeground } from '../SelectionForeground/SelectionForeground'
import { TextCursorHint } from '../TextCursorHint/TextCursorHint'
import { ZoomPanel } from '../ZoomPanel/ZoomPanel'

interface TldrawCanvasProps {
  board: Board
  currentUserId: string
}

const SAVE_DELAY_MS = 1000
const PREVIEW_IDLE_DELAY_MS = 60_000
const KEEPALIVE_MAX_BYTES = 60 * 1024
const PREVIEW_ASPECT_RATIO = 16 / 9
const PREVIEW_PADDING = 64
const highlightLayerOpacity = 1 - Math.sqrt(1 - 0.6)
const shapeUtils = [
  PlaceholderTextShapeUtil.configure({ showTextOutline: false }),
  HighlightShapeUtil.configure({
    underlayOpacity: highlightLayerOpacity,
    overlayOpacity: highlightLayerOpacity,
  }),
]
const uiOverrides: TLUiOverrides = {
  tools(editor, tools) {
    return Object.fromEntries(Object.entries(tools).map(([id, tool]) => [id, {
      ...tool,
      onSelect(source) {
        editor.updateInstanceState({ isToolLocked: id !== 'text' })
        tool.onSelect(source)
      },
    }]))
  },
  actions(_editor, actions) {
    const availableActions = { ...actions }
    delete availableActions['toggle-tool-lock']
    return availableActions
  },
}
const iconUrls = {
  fonts: canvasFontUrls,
  icons: {
    edit: '/icons/edit.svg',
    plus: '/icons/plus.svg',
    check: '/icons/check.svg',
    'dots-vertical': '/icons/dots-vertical.svg',
    'drag-handle-dots': '/icons/drag-handle-dots.svg',
  },
}

function OnTheCanvas() {
  return <><RemoteSelections /><TextCursorHint /></>
}

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
  const room = useRoom()
  const [records, setRecords] = useState<LiveMap<string, JsonObject> | null>(null)
  const [connectionFailed, setConnectionFailed] = useState(false)
  const queryClient = useQueryClient()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveQueue = useRef<Promise<void>>(Promise.resolve())
  const previewPromise = useRef<Promise<void> | null>(null)
  const latestVersion = useRef(board.dataVersion)
  const changeSequence = useRef(0)
  const dirty = useRef(board.previewVersion < board.dataVersion)
  const saveLeader = useRef(false)
  const cleanupMount = useRef<(() => void) | null>(null)

  useEffect(() => {
    let cancelled = false
    void room.getStorage()
      .then(({ root }) => {
        if (cancelled) return
        const sharedRecords = root.get('records')
        if (sharedRecords instanceof LiveMap) {
          setRecords(sharedRecords as LiveMap<string, JsonObject>)
        } else {
          setConnectionFailed(true)
        }
      })
      .catch(() => {
        if (!cancelled) setConnectionFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [room])

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
    const pendingSave = saveQueue.current
      .catch(() => {})
      .then(async () => {
        while (saveLeader.current) {
          const snapshot = editor.getSnapshot()
          try {
            const updated = await saveBoardSnapshot(board.id, snapshot, latestVersion.current)
            latestVersion.current = updated.dataVersion
            if (sequence === changeSequence.current) {
              queryClient.setQueryData<Board>(
                boardQueryKeys.detail(board.id, currentUserId),
                (current) => current
                  ? { ...current, data: snapshot, dataVersion: updated.dataVersion }
                  : current,
              )
            }
            return
          } catch (error) {
            if (!(error instanceof BoardVersionConflictError)) throw error
            latestVersion.current = error.dataVersion
            try {
              const savedBoard = await getBoard(board.id)
              latestVersion.current = Math.max(latestVersion.current, savedBoard.dataVersion)
              if (savedBoard.dataVersion >= error.dataVersion &&
                hasSameDocument(savedBoard.data, snapshot.document.store)) {
                if (sequence === changeSequence.current) {
                  dirty.current = savedBoard.previewVersion < savedBoard.dataVersion
                }
                return
              }
            } catch {
              // Retry with the version returned by the conflicting save.
            }
          }
        }
      })

    saveQueue.current = pendingSave
    return pendingSave
  }, [board.id, currentUserId, queryClient])

  const flushPreview = useCallback((editor: Editor, onStale: () => void): Promise<void> => {
    if (!dirty.current || !saveLeader.current) return Promise.resolve()
    if (previewPromise.current) return previewPromise.current

    const pendingPreview = (async () => {
      while (dirty.current && saveLeader.current) {
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
      .catch((error: unknown) => {
        if (error instanceof BoardPreviewStaleError && saveLeader.current) onStale()
      })
      .finally(() => {
        previewPromise.current = null
      })

    previewPromise.current = pendingPreview
    return pendingPreview
  }, [board.id, persistSnapshot, updatePreviewCache])

  const handleMount = useCallback(
    (editor: Editor) => {
      cleanupMount.current?.()
      if (!records) return

      editor.user.updateUserPreferences({ locale: 'en' })

      const disconnectDocument = connectDocumentSync(editor, room, records, board.data)
      editor.updateInstanceState({ isToolLocked: true })
      const disconnectPresence = connectPresence(editor, room, currentUserId)

      function requestPreview() {
        void flushPreview(editor, () => {
          if (!saveTimer.current) {
            saveTimer.current = setTimeout(() => {
              saveTimer.current = null
              void persistSnapshot(editor, changeSequence.current)
            }, SAVE_DELAY_MS)
          }
          if (previewTimer.current) clearTimeout(previewTimer.current)
          previewTimer.current = setTimeout(() => {
            previewTimer.current = null
            requestPreview()
          }, SAVE_DELAY_MS)
        })
      }

      const isCurrentLeader = () => {
        const self = room.getSelf()
        return self !== null && room.getOthers().every(
          (other) => self.connectionId < other.connectionId,
        )
      }
      saveLeader.current = isCurrentLeader()
      const schedulePersistence = () => {
        if (saveTimer.current) clearTimeout(saveTimer.current)
        if (previewTimer.current) clearTimeout(previewTimer.current)
        dirty.current = true
        changeSequence.current += 1
        const sequence = changeSequence.current
        if (saveLeader.current) {
          saveTimer.current = setTimeout(() => {
            saveTimer.current = null
            void persistSnapshot(editor, sequence)
          }, SAVE_DELAY_MS)

          previewTimer.current = setTimeout(() => {
            previewTimer.current = null
            requestPreview()
          }, PREVIEW_IDLE_DELAY_MS)
        }
      }
      const unlistenSave = editor.store.listen(schedulePersistence, {
        scope: 'document', source: 'all',
      })

      let wasLeader = saveLeader.current
      let leadershipGeneration = 0
      let disposed = false
      const reconcilePersistence = () => {
        const generation = ++leadershipGeneration
        const sequence = changeSequence.current
        void getBoard(board.id)
          .then((savedBoard) => {
            if (disposed || !saveLeader.current || generation !== leadershipGeneration) return
            latestVersion.current = Math.max(latestVersion.current, savedBoard.dataVersion)
            if (sequence !== changeSequence.current) return

            if (hasSameDocument(savedBoard.data, editor.store.serialize('document'))) {
              dirty.current = savedBoard.previewVersion < savedBoard.dataVersion
              if (dirty.current && !previewTimer.current) {
                previewTimer.current = setTimeout(() => {
                  previewTimer.current = null
                  requestPreview()
                }, PREVIEW_IDLE_DELAY_MS)
              }
            } else {
              schedulePersistence()
            }
          })
          .catch(() => {
            if (!disposed && saveLeader.current && generation === leadershipGeneration &&
              sequence === changeSequence.current) schedulePersistence()
          })
      }
      const updateLeadership = () => {
        const isLeader = isCurrentLeader()
        saveLeader.current = isLeader
        if (isLeader === wasLeader) return
        wasLeader = isLeader
        if (isLeader && (changeSequence.current > 0 || dirty.current)) reconcilePersistence()
        else leadershipGeneration += 1
      }
      const unlistenLeadership = room.subscribe('others', updateLeadership)
      const unlistenStatus = room.subscribe('status', updateLeadership)

      if (dirty.current && saveLeader.current) {
        previewTimer.current = setTimeout(() => {
          previewTimer.current = null
          requestPreview()
        }, PREVIEW_IDLE_DELAY_MS)
      }

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') requestPreview()
      }
      const handlePageHide = () => requestPreview()
      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('pagehide', handlePageHide)

      cleanupMount.current = () => {
        disposed = true
        leadershipGeneration += 1
        if (dirty.current) requestPreview()
        unlistenSave()
        unlistenLeadership()
        unlistenStatus()
        disconnectPresence()
        disconnectDocument()
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('pagehide', handlePageHide)
      }
    },
    [board.data, board.id, currentUserId, flushPreview, persistSnapshot, records, room],
  )

  useEffect(() => {
    return () => {
      cleanupMount.current?.()
      if (saveTimer.current) clearTimeout(saveTimer.current)
      if (previewTimer.current) clearTimeout(previewTimer.current)
    }
  }, [])

  if (connectionFailed) return <div role="alert">Unable to connect to the board.</div>
  if (!records) return null

  return (
    <Tldraw
      assetUrls={iconUrls}
      shapeUtils={shapeUtils}
      overrides={uiOverrides}
      onMount={handleMount}
      options={{ collaboratorInactiveTimeoutMs: BOARD_IDLE_TIMEOUT_MS }}
      components={{
        Background: BoardBackground,
        CollaboratorCursor,
        CollaboratorShapeIndicator: null,
        OnTheCanvas,
        ShapeIndicators: null,
        SelectionForeground,
        RichTextToolbar: BoardTextToolbar,
        MenuPanel: () => (
          <BoardNamePanel name={board.name} workspaceSlug={board.workspace.slug} />
        ),
        SharePanel: null,
        NavigationPanel: ZoomPanel,
        Toolbar: BoardToolbar,
      }}
    />
  )
}
