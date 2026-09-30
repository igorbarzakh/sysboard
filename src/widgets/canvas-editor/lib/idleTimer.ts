export const BOARD_IDLE_TIMEOUT_MS = 3 * 60 * 1000

export function isPresenceActive(lastActivityAt: number | null, now: number): boolean {
  return lastActivityAt !== null && now - lastActivityAt < BOARD_IDLE_TIMEOUT_MS
}

export function createIdleTimer(timeoutMs: number, onChange: (idle: boolean) => void) {
  let lastActivityAt = Date.now()
  let idle = false
  let timeout: ReturnType<typeof setTimeout> | null = null

  const schedule = (delay: number) => {
    timeout = setTimeout(() => {
      timeout = null
      const remaining = timeoutMs - (Date.now() - lastActivityAt)
      if (remaining > 0) {
        schedule(remaining)
      } else if (!idle) {
        idle = true
        onChange(true)
      }
    }, delay)
  }

  schedule(timeoutMs)

  return {
    activity() {
      lastActivityAt = Date.now()
      if (idle) {
        idle = false
        onChange(false)
        schedule(timeoutMs)
      }
    },
    dispose() {
      if (timeout !== null) clearTimeout(timeout)
    },
  }
}
