import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { DefaultColorStyle, DefaultFontFaces, DefaultFontStyle, DefaultSizeStyle, useEditor, useValue } from 'tldraw'
import { getEmptyTextHeight, TEXT_FIELD_OUTLINE_WIDTH, TEXT_PLACEHOLDER, TEXT_PLACEHOLDER_FONT_SIZE } from '../../lib/textPlaceholder'
import styles from './TextCursorHint.module.scss'

export function TextCursorHint() {
  const editor = useEditor()
  const isTextTool = useValue('text tool selected', () => editor.getCurrentToolId() === 'text', [editor])
  const isEditing = useValue('text shape editing', () => editor.getEditingShapeId() !== null, [editor])
  const zoom = useValue('text hint zoom', () => editor.getZoomLevel(), [editor])
  const fieldHeight = useValue('empty text field height', () => getEmptyTextHeight(
    editor,
    editor.getStyleForNextShape(DefaultFontStyle),
    editor.getStyleForNextShape(DefaultSizeStyle),
  ), [editor])
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!isTextTool) return
    editor.fonts.requestFonts([DefaultFontFaces.tldraw_sans.normal.normal])
    editor.setStyleForNextShapes(DefaultSizeStyle, 's')
    editor.setStyleForNextShapes(DefaultColorStyle, 'black')
    editor.setStyleForNextShapes(DefaultFontStyle, 'sans')
  }, [editor, isTextTool])

  useEffect(() => {
    if (!isTextTool) return
    const container = editor.getContainer()
    const canvas = container.querySelector('.tl-canvas')
    if (!canvas) return

    const onPointerMove = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !canvas.contains(event.target)) {
        setPosition(null)
        return
      }
      const bounds = container.getBoundingClientRect()
      setPosition({ x: event.clientX - bounds.left, y: event.clientY - bounds.top })
    }
    const onPointerLeave = () => setPosition(null)

    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerdown', onPointerMove)
    container.addEventListener('pointerleave', onPointerLeave)
    return () => {
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerdown', onPointerMove)
      container.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [editor, isTextTool])

  if (!isTextTool || isEditing || !position) return null

  return createPortal(
    <span
      className={styles.hint}
      style={{
        left: position.x + TEXT_FIELD_OUTLINE_WIDTH,
        top: position.y + TEXT_FIELD_OUTLINE_WIDTH + fieldHeight * zoom / 2,
        fontSize: TEXT_PLACEHOLDER_FONT_SIZE * zoom,
      }}
      aria-hidden="true"
    >
      {TEXT_PLACEHOLDER}
    </span>,
    editor.getContainer(),
  )
}
