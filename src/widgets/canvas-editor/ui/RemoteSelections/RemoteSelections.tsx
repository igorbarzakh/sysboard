import { useEffect, useState } from 'react'
import { Box, useEditor, useValue, type Editor, type TLShapeId } from 'tldraw'
import { isPresenceActive } from '../../lib/idleTimer'
import styles from './RemoteSelections.module.scss'

function getSelectionBounds(editor: Editor, shapeIds: TLShapeId[]) {
  const transforms = shapeIds.map((id) => editor.getShapePageTransform(id))
  const rotation = transforms[0]?.rotation() ?? 0
  const sharedRotation = transforms.every((transform) => transform?.rotation() === rotation)
    ? rotation
    : 0

  if (!sharedRotation) {
    return { bounds: editor.getShapesPageBounds(shapeIds), rotation: 0 }
  }

  if (shapeIds.length === 1) {
    const bounds = editor.getShapeGeometry(shapeIds[0]).bounds.clone()
    bounds.point = transforms[0]!.applyToPoint(bounds.point)
    return { bounds, rotation: sharedRotation }
  }

  const bounds = Box.FromPoints(shapeIds.flatMap((id, index) =>
    transforms[index]!.applyToPoints(editor.getShapeGeometry(id).bounds.corners)
      .map((point) => point.rot(-sharedRotation)),
  ))
  bounds.point = bounds.point.rot(sharedRotation)
  return { bounds, rotation: sharedRotation }
}

export function RemoteSelections() {
  const editor = useEditor()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const interval = window.setInterval(
      () => setNow(Date.now()),
      editor.options.collaboratorCheckIntervalMs,
    )
    return () => window.clearInterval(interval)
  }, [editor])
  const selections = useValue('remote selections', () => {
    const renderingShapes = new Map(editor.getRenderingShapes().map((shape) => [shape.id, shape]))
    return editor.getCollaboratorsOnCurrentPage().flatMap((collaborator) => {
      const shapeIds = collaborator.selectedShapeIds.filter((id) =>
        renderingShapes.has(id) && !editor.isShapeHidden(id),
      )
      if (!shapeIds.length) return []
      const { bounds, rotation } = getSelectionBounds(editor, shapeIds)
      if (!bounds) return []
      const zIndex = Math.max(...shapeIds.map((id) => renderingShapes.get(id)!.index)) + 1
      return [{
        id: collaborator.id,
        color: collaborator.color,
        bounds,
        rotation,
        zIndex,
        lastActivityAt: collaborator.lastActivityTimestamp,
      }]
    })
  }, [editor])
  const zoom = useValue('remote selection zoom', () => editor.getZoomLevel(), [editor])
  const handleSize = 10 / zoom
  const visibleSelections = selections.filter(({ lastActivityAt }) =>
    isPresenceActive(lastActivityAt, now),
  )

  return (
    <>
      {visibleSelections.map(({ id, color, bounds, rotation, zIndex }) => (
        <svg key={id} className={styles.overlay} style={{ zIndex }} aria-hidden="true">
          <g
            transform={`translate(${bounds.x} ${bounds.y}) rotate(${rotation * 180 / Math.PI})`}
            stroke={color}
            strokeWidth={2 / zoom}
          >
            <rect width={bounds.width} height={bounds.height} fill="none" />
            {[
              [0, 0],
              [bounds.width, 0],
              [bounds.width, bounds.height],
              [0, bounds.height],
            ].map(([x, y], index) => (
              <rect
                key={index}
                x={x - handleSize / 2}
                y={y - handleSize / 2}
                width={handleSize}
                height={handleSize}
                rx={2 / zoom}
                fill="white"
              />
            ))}
          </g>
        </svg>
      ))}
    </>
  )
}
