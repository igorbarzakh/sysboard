import { LiveMap, type JsonObject, type Room } from '@liveblocks/client'
import type { Editor, TLRecord, TLStoreSnapshot } from 'tldraw'

export function getInitialRecords(data: unknown): LiveMap<string, JsonObject> {
  if (typeof data !== 'object' || data === null) return new LiveMap<string, JsonObject>()

  const snapshot = data as Record<string, unknown>
  const document = snapshot.document ?? snapshot
  if (typeof document !== 'object' || document === null) return new LiveMap<string, JsonObject>()

  const store = (document as Record<string, unknown>).store
  if (typeof store !== 'object' || store === null) return new LiveMap<string, JsonObject>()

  return new LiveMap<string, JsonObject>(
    Object.entries(store)
      .filter(([, record]) => typeof record === 'object' && record !== null)
      .map(([id, record]) => [id, record as JsonObject]),
  )
}

export function connectDocumentSync(
  editor: Editor,
  room: Room,
  records: LiveMap<string, JsonObject>,
  snapshot: unknown,
): () => void {
  if (snapshot && typeof snapshot === 'object') {
    try {
      editor.loadSnapshot(snapshot as TLStoreSnapshot)
    } catch {
    }
  }

  if (records.size === 0) {
    room.batch(() => {
      for (const record of Object.values(editor.store.serialize('document'))) {
        records.set(record.id, record as unknown as JsonObject)
      }
    })
  } else {
    const localRecords = editor.store.serialize('document')
    editor.store.mergeRemoteChanges(() => {
      editor.store.remove(Object.keys(localRecords).filter((id) => !records.has(id)) as TLRecord['id'][])
      editor.store.put([...records.values()] as unknown as TLRecord[])
    })
  }

  const unlistenStorage = room.subscribe(records, (updates) => {
    const toRemove: TLRecord['id'][] = []
    const toPut: TLRecord[] = []
    for (const update of updates) {
      if (update.type !== 'LiveMap') continue
      for (const [id, change] of Object.entries(update.updates)) {
        if (change.type === 'delete') {
          toRemove.push(id as TLRecord['id'])
        } else {
          const record = records.get(id)
          if (record) toPut.push(record as unknown as TLRecord)
        }
      }
    }
    editor.store.mergeRemoteChanges(() => {
      if (toRemove.length) editor.store.remove(toRemove)
      if (toPut.length) editor.store.put(toPut)
    })
  }, { isDeep: true })

  const unlistenLocal = editor.store.listen(({ changes }) => {
    room.batch(() => {
      for (const record of Object.values(changes.added)) records.set(record.id, record as unknown as JsonObject)
      for (const [, record] of Object.values(changes.updated)) records.set(record.id, record as unknown as JsonObject)
      for (const record of Object.values(changes.removed)) records.delete(record.id)
    })
  }, { scope: 'document', source: 'user' })

  return () => {
    unlistenLocal()
    unlistenStorage()
  }
}
