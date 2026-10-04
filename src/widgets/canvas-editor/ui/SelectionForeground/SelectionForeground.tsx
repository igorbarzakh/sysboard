import { useRef } from 'react'
import {
  Box,
  TldrawSelectionForeground,
  toDomPrecision,
  track,
  useEditor,
  useTransform,
  useValue,
  type TLSelectionForegroundProps,
  type TLShape,
} from 'tldraw'

const DraggingSelectionForeground = track(function DraggingSelectionForeground({ bounds, rotation }: TLSelectionForegroundProps) {
  const editor = useEditor()
  const ref = useRef<SVGSVGElement>(null)
  const shape = editor.getOnlySelectedShape()
  const util = shape ? editor.getShapeUtil(shape) : null
  // tldraw uses this hook for selection bounds, but omits it from its public types.
  const outlineUtil = util as (typeof util & {
    expandSelectionOutlinePx?: (shape: TLShape) => number | Box
  })
  const expansion = shape ? outlineUtil?.expandSelectionOutlinePx?.(shape) ?? 0 : 0
  const expandedBounds = expansion instanceof Box
    ? bounds.clone().expand(expansion).zeroFix()
    : bounds.clone().expandBy(expansion).zeroFix()

  useTransform(ref, bounds.x, bounds.y, 1, rotation, {
    x: expandedBounds.x - bounds.x,
    y: expandedBounds.y - bounds.y,
  })

  if (shape && editor.isShapeHidden(shape)) return null

  const size = 8 / editor.getEfficientZoomLevel()
  const { width, height } = expandedBounds
  const showHandles = width >= size && height >= size && !editor.getInstanceState().isReadonly &&
    (!shape || (util && util.canResize(shape) && !util.hideResizeHandles(shape) && !editor.isShapeOrAncestorLocked(shape)))
  const corners = [
    { id: 'top-left', x: 0, y: 0 },
    { id: 'top-right', x: width, y: 0 },
    { id: 'bottom-right', x: width, y: height },
    { id: 'bottom-left', x: 0, y: height },
  ]

  return (
    <svg ref={ref} className="tl-overlays__item tl-selection__fg" data-testid="selection-foreground">
      <rect className="tl-selection__fg__outline" width={toDomPrecision(width)} height={toDomPrecision(height)} />
      {showHandles && corners.map(({ id, x, y }) => (
        <rect
          key={id}
          className="tl-corner-handle"
          data-testid={`selection.resize.${id}`}
          x={toDomPrecision(x - size / 2)}
          y={toDomPrecision(y - size / 2)}
          width={toDomPrecision(size)}
          height={toDomPrecision(size)}
        />
      ))}
    </svg>
  )
})

export function SelectionForeground(props: TLSelectionForegroundProps) {
  const editor = useEditor()
  const isDragging = useValue('selection dragging', () => editor.isIn('select.translating'), [editor])
  const zoom = useValue('selection zoom', () => editor.getEfficientZoomLevel(), [editor])
  const hideCorners = Math.min(props.bounds.width, props.bounds.height) * zoom < 8

  return (
    <div data-selection-corners={hideCorners ? 'hidden' : 'visible'}>
      {isDragging
        ? <DraggingSelectionForeground {...props} />
        : <TldrawSelectionForeground {...props} />}
    </div>
  )
}
