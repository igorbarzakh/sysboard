import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Eraser, Highlighter, Pen } from 'lucide-react'
import {
  DefaultColorStyle,
  DefaultSizeStyle,
  TldrawUiToolbar,
  TldrawUiToolbarButton,
  useEditor,
  useReadonly,
  useTools,
  useTranslation,
  useValue,
} from 'tldraw'
import { highlightColors } from '../../lib/highlightPalette'
import { markerColors } from '../../lib/markerPalette'
import styles from './DrawingMenu.module.scss'

const drawingTools = [
  { id: 'draw', label: 'Marker', icon: Pen },
  { id: 'highlight', label: 'Highlighter', icon: Highlighter },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
]

const thicknesses = [
  { value: 's', label: 'Thin', strokeWidth: 1 },
  { value: 'l', label: 'Thick', strokeWidth: 4 },
] as const

export function DrawingMenu() {
  const editor = useEditor()
  const tools = useTools()
  const msg = useTranslation()
  const isReadonly = useReadonly()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ left: 0, top: 0 })
  const alignPanel = useCallback((panel: HTMLDivElement | null) => {
    const trigger = triggerRef.current
    if (!panel || !trigger) return
    const canvas = editor.getContainer()
    const toolbar = trigger.closest('.tlui-main-toolbar__tools')
    if (!toolbar) return
    const updateAlignment = () => {
      const canvasBounds = canvas.getBoundingClientRect()
      setPosition({
        left: canvasBounds.left + canvasBounds.width / 2,
        top: toolbar.getBoundingClientRect().top - 6,
      })
    }
    updateAlignment()
    const observer = new ResizeObserver(updateAlignment)
    observer.observe(panel)
    observer.observe(canvas)
    observer.observe(toolbar)
    return () => observer.disconnect()
  }, [editor])
  const { toolId, color, size } = useValue('drawing options', () => ({
    toolId: editor.getCurrentToolId(),
    color: editor.getStyleForNextShape(DefaultColorStyle),
    size: editor.getStyleForNextShape(DefaultSizeStyle),
  }), [editor])
  const isSelected = drawingTools.some((tool) => tool.id === toolId)
  const isErasing = toolId === 'eraser'
  const colors = toolId === 'highlight'
    ? highlightColors
    : markerColors
  const markerColor = useRef(markerColors.some(({ value }) => value === color) ? color : 'black')
  const highlighterColor = useRef(highlightColors.some(({ value }) => value === color)
    ? color : highlightColors[0].value)
  const previousTool = useRef(toolId)

  useEffect(() => {
    if (isReadonly) return
    const toolChanged = previousTool.current !== toolId
    previousTool.current = toolId
    if (toolId !== 'draw' && toolId !== 'highlight') return
    const rememberedColor = toolId === 'draw' ? markerColor : highlighterColor
    if (toolChanged) {
      if (color !== rememberedColor.current) {
        editor.setStyleForNextShapes(DefaultColorStyle, rememberedColor.current)
      }
      return
    }
    const isAvailable = toolId === 'draw'
      ? markerColors.some(({ value }) => value === color)
      : highlightColors.some(({ value }) => value === color)
    if (isAvailable) rememberedColor.current = color
    else editor.setStyleForNextShapes(DefaultColorStyle, rememberedColor.current)
  }, [color, editor, isReadonly, toolId])

  useEffect(() => {
    if (isReadonly || !isSelected || (size === 's' || size === 'l')) return
    editor.setStyleForNextShapes(DefaultSizeStyle, 's')
  }, [editor, isReadonly, isSelected, size])

  useEffect(() => {
    if (!isOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  if (isReadonly) return null

  return (
    <>
      <TldrawUiToolbarButton
        ref={triggerRef}
        type="tool"
        title="Marker"
        aria-pressed={isSelected}
        aria-expanded={isOpen && isSelected}
        aria-controls="board-drawing-options"
        data-testid="tools.draw"
        onClick={() => {
          if (isOpen && isSelected) {
            setIsOpen(false)
            tools.select.onSelect('toolbar')
            return
          }
          if (!isSelected) tools.draw.onSelect('toolbar')
          setIsOpen(true)
        }}
      >
        <Pen size={20} aria-hidden="true" />
      </TldrawUiToolbarButton>
      {isOpen && isSelected && createPortal(
        <div
          id="board-drawing-options"
          ref={alignPanel}
          className={styles.panel}
          style={position}
        >
          <TldrawUiToolbar className={styles.group} label="Drawing tool">
            {drawingTools.map(({ id, label, icon: Icon }) => (
              <TldrawUiToolbarButton
                key={id}
                type="tool"
                className={styles.button}
                title={label}
                aria-pressed={toolId === id}
                onClick={() => tools[id].onSelect('toolbar')}
              >
                <Icon size={16} aria-hidden="true" />
              </TldrawUiToolbarButton>
            ))}
          </TldrawUiToolbar>
          <TldrawUiToolbar className={styles.group} label="Stroke thickness">
            {thicknesses.map(({ value, label, strokeWidth }) => (
              <TldrawUiToolbarButton
                key={value}
                type="tool"
                className={`${styles.button} ${styles.thicknessButton}`}
                title={label}
                aria-pressed={(size === 'l' ? 'l' : 's') === value}
                disabled={isErasing}
                onClick={() => editor.setStyleForNextShapes(DefaultSizeStyle, value)}
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d={value === 's'
                      ? 'M6.5 14.5C7.54992 11.5755 10.2886 8.5 11.5 8.5C13.4006 8.5 12.268 13.4943 14.3243 13.4943C15.79 13.4943 17.5 11.5 17.5 11.5'
                      : 'M6.50018 15C7.5501 12.0755 10.2888 9 11.5002 9C13.4008 9 12.2682 13.9943 14.3245 13.9943C15.7902 13.9943 17.5002 12 17.5002 12'}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </TldrawUiToolbarButton>
            ))}
          </TldrawUiToolbar>
          <TldrawUiToolbar className={`${styles.group} ${styles.colors}`} label={msg('style-panel.color')}>
            {colors.map(({ value, hex, label }) => (
              <TldrawUiToolbarButton
                key={value}
                type="tool"
                className={`${styles.button} ${styles.colorButton}`}
                title={label}
                aria-pressed={color === value}
                disabled={isErasing}
                onClick={() => editor.setStyleForNextShapes(DefaultColorStyle, value)}
              >
                <span className={styles.swatch} style={{
                  backgroundColor: hex,
                  borderColor: toolId === 'highlight' ? undefined : markerColors.find((option) => option.value === value)?.border,
                }} />
              </TldrawUiToolbarButton>
            ))}
          </TldrawUiToolbar>
        </div>,
        editor.getContainer(),
      )}
    </>
  )
}
