import { useRef } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useActions, usePassThroughWheelEvents, useTranslation } from 'tldraw'
import styles from './ZoomPanel.module.scss'

export function ZoomPanel() {
  const actions = useActions()
  const msg = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  usePassThroughWheelEvents(ref)

  return (
    <div ref={ref} className={styles.panel} role="group" aria-label={msg('navigation-zone.zoom')}>
      <button
        type="button"
        className={styles.button}
        aria-label={msg('action.zoom-out')}
        title={msg('action.zoom-out')}
        onClick={() => actions['zoom-out'].onSelect('navigation-zone')}
      >
        <Minus size={20} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={styles.button}
        aria-label={msg('action.zoom-in')}
        title={msg('action.zoom-in')}
        onClick={() => actions['zoom-in'].onSelect('navigation-zone')}
      >
        <Plus size={20} aria-hidden="true" />
      </button>
    </div>
  )
}
