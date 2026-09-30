import { useId } from 'react'
import type { TLCursorProps } from 'tldraw'
import styles from './CollaboratorCursor.module.scss'

function getCursorColorMatrix(color: string): string {
  const red = Number.parseInt(color.slice(1, 3), 16) / 255
  const green = Number.parseInt(color.slice(3, 5), 16) / 255
  const blue = Number.parseInt(color.slice(5, 7), 16) / 255

  return [
    1 - red, 0, 0, 0, red,
    0, 1 - green, 0, 0, green,
    0, 0, 1 - blue, 0, blue,
    0, 0, 0, 1, 0,
  ].join(' ')
}

export function CollaboratorCursor({ point, color, name, zoom }: TLCursorProps) {
  const filterId = useId().replaceAll(':', '')
  if (!point) return null
  const cursorColor = color ?? '#7c3aed'

  return (
    <div
      className={styles.cursor}
      style={{
        transform: `translate(${point.x}px, ${point.y}px) scale(${1 / zoom})`,
      }}
    >
      <svg className={styles.arrow} viewBox="0 0 17 19" aria-hidden="true">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={getCursorColorMatrix(cursorColor)} />
          </filter>
        </defs>
        <image href="/cursors/local-pointer.svg" width="17" height="19" filter={`url(#${filterId})`} />
      </svg>
      {name && (
        <span className={styles.name} style={{ backgroundColor: cursorColor }}>
          {name}
        </span>
      )}
    </div>
  )
}
