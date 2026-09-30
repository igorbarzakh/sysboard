import { useEditor, useValue } from 'tldraw'
import styles from './BoardBackground.module.scss'

const GRID_SPACING = 8
const GRID_FACTORS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20]

export function BoardBackground() {
  const editor = useEditor()
  const { x, y, z } = useValue('board background camera', () => editor.getCamera(), [editor])
  const roundedFactor = Math.max(1, Math.round(1 / z))
  const factor = GRID_FACTORS.find((candidate) => candidate >= roundedFactor) ?? 20
  const lowZoomSpacingBoost = 1 + 0.5 * Math.min(1, Math.max(0, (1.5 - z) / 0.5))
  const spacing = GRID_SPACING * factor * z * lowZoomSpacingBoost
  const zoomSteps = editor.getCameraOptions().zoomSteps
  const minZoom = zoomSteps[0]
  const maxZoom = zoomSteps[zoomSteps.length - 1]
  const zoomProgress = Math.min(1, Math.max(0, (z - minZoom) / (maxZoom - minZoom || 1)))
  const radius = 0.7 + 3.3 * zoomProgress ** 2
  const offset = spacing / 2

  return (
    <div
      className={styles.background}
      style={{
        backgroundImage: `radial-gradient(circle, #c4c4c4 ${radius}px, transparent ${radius}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
        backgroundPosition: `${x * z - offset}px ${y * z - offset}px`,
      }}
    />
  )
}
