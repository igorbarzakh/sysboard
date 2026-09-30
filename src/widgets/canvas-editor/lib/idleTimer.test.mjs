import assert from 'node:assert/strict'
import { mock, test } from 'node:test'
import { createIdleTimer, isPresenceActive } from './idleTimer.ts'

test('hides presence after three minutes without activity and restores it on activity', () => {
  mock.timers.enable({ apis: ['Date', 'setTimeout'] })
  try {
    const changes = []
    const timer = createIdleTimer(3 * 60 * 1000, (idle) => changes.push(idle))

    mock.timers.tick(2 * 60 * 1000)
    timer.activity()
    mock.timers.tick(2 * 60 * 1000)
    assert.deepEqual(changes, [])

    mock.timers.tick(60 * 1000)
    assert.deepEqual(changes, [true])

    timer.activity()
    assert.deepEqual(changes, [true, false])

    timer.dispose()
    mock.timers.tick(3 * 60 * 1000)
    assert.deepEqual(changes, [true, false])
  } finally {
    mock.timers.reset()
  }
})

test('remote selection expires at the same three-minute inactivity limit', () => {
  const now = 1_000_000
  assert.equal(isPresenceActive(now - 3 * 60 * 1000 + 1, now), true)
  assert.equal(isPresenceActive(now - 3 * 60 * 1000, now), false)
})
