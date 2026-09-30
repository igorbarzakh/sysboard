import { isEqual } from '@tldraw/utils'

export function hasSameDocument(savedSnapshot: unknown, currentRecords: Record<string, unknown>): boolean {
  if (typeof savedSnapshot !== 'object' || savedSnapshot === null) return false

  const snapshot = savedSnapshot as Record<string, unknown>
  const document = snapshot.document ?? snapshot
  if (typeof document !== 'object' || document === null) return false

  const store = (document as Record<string, unknown>).store
  return typeof store === 'object' && store !== null && isEqual(store, currentRecords)
}
