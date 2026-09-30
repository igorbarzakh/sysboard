import { type JsonObject, type Room } from '@liveblocks/client'
import {
  atom,
  createPresenceStateDerivation,
  InstancePresenceRecordType,
  react,
  TLPOINTER_ID,
  type Editor,
  type TLInstancePresence,
} from 'tldraw'
import { BOARD_IDLE_TIMEOUT_MS, createIdleTimer } from './idleTimer'

const CURSOR_COLORS = [
  '#a21caf', '#1d4ed8', '#0f766e', '#c2410c', '#6d28d9',
  '#b91c1c', '#15803d', '#be185d', '#4338ca', '#92400e',
]

function getCursorColor(userId: string, otherUserIds: string[]): string {
  const participants = [...new Set([userId, ...otherUserIds])].sort()
  const usedColors = new Set<number>()

  for (const participant of participants) {
    let hash = 0
    for (const character of participant) hash = (hash * 31 + character.charCodeAt(0)) | 0
    let colorIndex = (hash >>> 0) % CURSOR_COLORS.length
    while (usedColors.has(colorIndex) && usedColors.size < CURSOR_COLORS.length) {
      colorIndex = (colorIndex + 1) % CURSOR_COLORS.length
    }
    usedColors.add(colorIndex)
    if (participant === userId) return CURSOR_COLORS[colorIndex]
  }

  return CURSOR_COLORS[0]
}

function getRemotePresence(value: unknown): TLInstancePresence | null {
  if (typeof value !== 'object' || value === null) return null
  const record = value as Partial<TLInstancePresence>
  return record.typeName === 'instance_presence' && typeof record.id === 'string'
    ? value as TLInstancePresence
    : null
}

export function connectPresence(editor: Editor, room: Room, currentUserId: string): () => void {
  const user = atom('liveblocks-user', {
    id: currentUserId,
    name: room.getSelf()?.info?.name ?? 'Anonymous',
    color: getCursorColor(currentUserId, room.getOthers().map((other) => other.id ?? '')),
  })
  const presence = createPresenceStateDerivation(
    user,
    InstancePresenceRecordType.createId(
      String(room.getSelf()?.connectionId ?? crypto.randomUUID()),
    ),
  )(editor.store)
  let idle = false
  let presenceFrame: number | null = null
  const unreactPresence = react('sync liveblocks presence', () => {
    const current = presence.get()
    if (presenceFrame !== null) cancelAnimationFrame(presenceFrame)
    if (idle) return
    presenceFrame = requestAnimationFrame(() => {
      if (!idle) room.updatePresence({ presence: current as unknown as JsonObject | null })
      presenceFrame = null
    })
  })
  const idleTimer = createIdleTimer(BOARD_IDLE_TIMEOUT_MS, (isIdle) => {
    idle = isIdle
    if (presenceFrame !== null) cancelAnimationFrame(presenceFrame)
    presenceFrame = null
    room.updatePresence({
      presence: isIdle ? null : presence.get() as unknown as JsonObject,
    })
  })
  const container = editor.getContainer()
  const activityEvents = ['pointermove', 'pointerdown', 'wheel'] as const
  for (const event of activityEvents) container.addEventListener(event, idleTimer.activity)
  const handleKeyDown = () => {
    editor.run(() => {
      editor.store.update(TLPOINTER_ID, (pointer) => ({
        ...pointer,
        lastActivityTimestamp: Date.now(),
      }))
    }, { history: 'ignore' })
    idleTimer.activity()
  }
  container.addEventListener('keydown', handleKeyDown)

  const remotePresenceIds = new Map<number, TLInstancePresence['id']>()
  const removeOther = (connectionId: number) => {
    const id = remotePresenceIds.get(connectionId)
    if (!id) return
    editor.store.mergeRemoteChanges(() => editor.store.remove([id]))
    remotePresenceIds.delete(connectionId)
  }
  const applyOther = (other: (ReturnType<typeof room.getOthers>)[number]) => {
    const next = getRemotePresence(other.presence.presence)
    const previousId = remotePresenceIds.get(other.connectionId)
    if (!next) {
      removeOther(other.connectionId)
      return
    }
    editor.store.mergeRemoteChanges(() => {
      if (previousId && previousId !== next.id) editor.store.remove([previousId])
      editor.store.put([next])
    })
    remotePresenceIds.set(other.connectionId, next.id)
  }
  const updateOwnColor = () => {
    const color = getCursorColor(currentUserId, room.getOthers().map((other) => other.id ?? ''))
    if (color !== user.get().color) user.set({ ...user.get(), color })
  }
  const unlistenOthers = room.subscribe('others', (others, event) => {
    if (event.type === 'reset') {
      editor.store.mergeRemoteChanges(() => editor.store.remove([...remotePresenceIds.values()]))
      remotePresenceIds.clear()
      for (const other of others) applyOther(other)
      updateOwnColor()
    } else if (event.type === 'leave') {
      removeOther(event.user.connectionId)
      updateOwnColor()
    } else {
      applyOther(event.user)
      if (event.type === 'enter') updateOwnColor()
    }
  })
  for (const other of room.getOthers()) applyOther(other)

  return () => {
    idleTimer.dispose()
    for (const event of activityEvents) container.removeEventListener(event, idleTimer.activity)
    container.removeEventListener('keydown', handleKeyDown)
    unreactPresence()
    unlistenOthers()
    if (presenceFrame !== null) cancelAnimationFrame(presenceFrame)
    editor.store.mergeRemoteChanges(() => editor.store.remove([...remotePresenceIds.values()]))
  }
}
