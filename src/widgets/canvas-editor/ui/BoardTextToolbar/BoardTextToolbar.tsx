import { useEffect, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { Popover } from '@base-ui/react/popover'
import { createPortal } from 'react-dom'
import { AlignCenter, AlignLeft, AlignRight, Bold, Check, ChevronDown, Link, List, Strikethrough, Unlink } from 'lucide-react'
import {
  DefaultColorStyle,
  DefaultFontStyle,
  DefaultFontFaces,
  DefaultSizeStyle,
  FONT_FAMILIES,
  TldrawUiToolbar,
  TldrawUiToolbarButton,
  useEditor,
  useGlobalMenuIsOpen,
  useValue,
  type TLTextShape,
  type TiptapEditor,
} from 'tldraw'
import { Button, Input } from '@shared/ui'
import { getTextColor, textColors } from '../../lib/textPalette'
import { getTextFormatting } from '../../lib/textFormatting'
import { applyTextFormatting } from '../../lib/applyTextFormatting'
import styles from './BoardTextToolbar.module.scss'

const fonts = [
  { value: 'sans', label: 'Simple' },
  { value: 'serif', label: 'Bookish' },
  { value: 'mono', label: 'Technical' },
  { value: 'draw', label: 'Scribbled' },
] as const
const sizes = [
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
  { value: 'xl', label: 'Extra large' },
] as const
const alignments = [
  { value: 'start', label: 'Align left', icon: AlignLeft },
  { value: 'middle', label: 'Align center', icon: AlignCenter },
  { value: 'end', label: 'Align right', icon: AlignRight },
] as const

function getLinkHref(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const href = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(new URL(href).protocol) ? href : null
  } catch {
    return null
  }
}

function TextPopover({ id, children, open, onOpenChange }: {
  id: string
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const editor = useEditor()
  // Track the menu without tldraw's useMenuIsOpen, which completes text editing.
  const [isOpen, changeOpen] = useGlobalMenuIsOpen(`${id}-${editor.contextId}`, onOpenChange)
  return <Popover.Root open={open ?? isOpen} onOpenChange={changeOpen}><div className={styles.popoverRoot}>{children}</div></Popover.Root>
}

function TextPopoverTrigger({ children }: { children: ReactElement }) {
  return <Popover.Trigger render={children} />
}

function TextPopoverContent({ children, side = 'bottom' }: { children: ReactNode; side?: 'top' | 'bottom' }) {
  const editor = useEditor()
  return (
    <Popover.Portal container={editor.getContainer()}>
      <Popover.Positioner side={side} sideOffset={16} className={styles.popoverPositioner}>
        <Popover.Popup className={styles.popover} initialFocus={false} finalFocus={false}>
          {children}
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  )
}

function Choice({ id, label, children, trigger, side }: {
  id: string
  label: string
  trigger: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom'
}) {
  return (
    <TextPopover id={id}>
      <TextPopoverTrigger>
        <TldrawUiToolbarButton type="tool" className={styles.trigger} title={label} onPointerDown={(event) => event.preventDefault()}>
          {typeof trigger === 'string' ? <span>{trigger}</span> : trigger}<ChevronDown size={12} strokeWidth={2} aria-hidden="true" />
        </TldrawUiToolbarButton>
      </TextPopoverTrigger>
      <TextPopoverContent side={side}>
        {children}
      </TextPopoverContent>
    </TextPopover>
  )
}

export function BoardTextToolbar() {
  const editor = useEditor()
  const state = useValue('text formatting toolbar', () => {
    if (editor.isIn('select.translating')) return null
    const editingShape = editor.getEditingShape()
    const shape = editingShape ?? editor.getOnlySelectedShape()
    const richTextEditor = editingShape ? editor.getRichTextEditor() : null
    const textEditor = richTextEditor && !richTextEditor.isDestroyed ? richTextEditor : null
    if (editor.getIsReadonly() || !shape || !editor.isShapeOfType(shape, 'text') || shape.isLocked) return null
    const bounds = editor.getShapePageBounds(shape)
    if (!bounds) return null
    const top = editor.pageToScreen({ x: bounds.midX, y: bounds.y })
    const bottom = editor.pageToScreen({ x: bounds.midX, y: bounds.maxY })
    return { shape, textEditor, x: top.x, y: top.y, bottom: bottom.y }
  }, [editor])

  if (!state) return null
  return <TextToolbar key={state.shape.id} {...state} />
}

function TextToolbar({ shape, textEditor, x, y, bottom }: {
  shape: TLTextShape
  textEditor: TiptapEditor | null
  x: number
  y: number
  bottom: number
}) {
  const editor = useEditor()
  const panelRef = useRef<HTMLDivElement>(null)
  const [, refresh] = useState(0)
  const [linkValue, setLinkValue] = useState('')
  const linkHref = getLinkHref(linkValue)
  const [linkOpen, setLinkOpen] = useState(false)

  useEffect(() => {
    editor.fonts.requestFonts(Object.values(DefaultFontFaces).map((font) => font.normal.normal))
  }, [editor])

  useEffect(() => {
    if (!textEditor) return
    const update = () => refresh((value) => value + 1)
    textEditor.on('transaction', update)
    return () => { textEditor.off('transaction', update) }
  }, [textEditor])

  const runTextAction = (action: (textEditor: TiptapEditor) => void) => {
    if (textEditor) {
      textEditor.commands.focus()
      action(textEditor)
    }
    else {
      const richText = applyTextFormatting(editor, shape.props.richText, action)
      editor.updateShape({ id: shape.id, type: 'text', props: { richText } })
    }
  }

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const position = () => {
      const viewport = editor.getContainer().getBoundingClientRect()
      const { width, height } = panel.getBoundingClientRect()
      const left = Math.max(viewport.left + 12, Math.min(x - width / 2, viewport.right - width - 12))
      const top = y - height - 12 >= viewport.top + 12 ? y - height - 12 : bottom + 12
      panel.style.left = `${left}px`
      panel.style.top = `${Math.max(viewport.top + 12, Math.min(top, viewport.bottom - height - 12))}px`
    }
    position()
    const observer = new ResizeObserver(position)
    observer.observe(panel)
    observer.observe(editor.getContainer())
    return () => observer.disconnect()
  }, [bottom, editor, x, y])

  const finishChoice = () => {
    editor.menus.clearOpenMenus()
    textEditor?.commands.focus()
  }
  const selectedColor = getTextColor(shape)
  const formatting = getTextFormatting(shape.props.richText)
  const isActive = (format: 'bold' | 'strike' | 'link' | 'bulletList') => textEditor?.isActive(format) ?? formatting[format]
  const AlignmentIcon = alignments.find(({ value }) => value === shape.props.textAlign)?.icon ?? AlignLeft

  return createPortal(
    <div ref={panelRef} className={styles.panel} onPointerDown={(event) => event.stopPropagation()}>
      <TldrawUiToolbar className={styles.group} label="Text appearance">
        <Choice id="board-text-color" label="Text color" side="top" trigger={<span className={styles.swatch} style={{ backgroundColor: selectedColor.hex, borderColor: selectedColor.border }} />}>
          <TldrawUiToolbar className={`${styles.menu} ${styles.colors}`} label="Text color">
            {textColors.map(({ color, hex, border, label }) => (
              <TldrawUiToolbarButton key={hex} type="tool" className={styles.colorButton} title={label} aria-pressed={selectedColor.hex === hex}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => {
                  editor.updateShape({ id: shape.id, type: 'text', props: { color }, meta: { ...shape.meta, textColor: hex } })
                  editor.setStyleForNextShapes(DefaultColorStyle, color)
                  finishChoice()
                }}>
                <span className={styles.swatch} style={{ backgroundColor: hex, borderColor: border }} />
              </TldrawUiToolbarButton>
            ))}
          </TldrawUiToolbar>
        </Choice>
        <Choice id="board-text-font" label="Text style" trigger={<span className={styles.fontPreview} style={{ fontFamily: FONT_FAMILIES[shape.props.font] }} aria-hidden="true">Aa</span>}>
          <TldrawUiToolbar className={styles.menu} orientation="vertical" label="Text style">
            {fonts.map(({ value, label }) => (
              <TldrawUiToolbarButton key={value} type="tool" className={styles.option} title={label} aria-pressed={shape.props.font === value}
                style={{ fontFamily: FONT_FAMILIES[value] }} onPointerDown={(event) => event.preventDefault()}
                onClick={() => {
                  editor.updateShape({ id: shape.id, type: 'text', props: { font: value } })
                  editor.setStyleForNextShapes(DefaultFontStyle, value)
                  finishChoice()
                }}>
                <span>{label}</span><Check size={14} strokeWidth={2} className={styles.check} aria-hidden="true" />
              </TldrawUiToolbarButton>
            ))}
          </TldrawUiToolbar>
        </Choice>
        <Choice id="board-text-size" label="Text size" trigger={sizes.find(({ value }) => value === shape.props.size)?.label ?? 'Small'}>
          <TldrawUiToolbar className={styles.menu} orientation="vertical" label="Text size">
            {sizes.map(({ value, label }) => (
              <TldrawUiToolbarButton key={value} type="tool" className={styles.option} title={label} aria-pressed={shape.props.size === value}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => {
                  editor.updateShape({ id: shape.id, type: 'text', props: { size: value } })
                  editor.setStyleForNextShapes(DefaultSizeStyle, value)
                  finishChoice()
                }}>
                <span>{label}</span><Check size={14} strokeWidth={2} className={styles.check} aria-hidden="true" />
              </TldrawUiToolbarButton>
            ))}
          </TldrawUiToolbar>
        </Choice>
      </TldrawUiToolbar>
      <TldrawUiToolbar className={`${styles.group} ${styles.formatting}`} label="Text formatting">
        <TldrawUiToolbarButton type="tool" className={styles.button} title="Bold" aria-pressed={isActive('bold')}
          onPointerDown={(event) => event.preventDefault()} onClick={() => runTextAction((text) => { text.chain().toggleMark('bold').run() })}>
          <Bold size={18} strokeWidth={3} aria-hidden="true" />
        </TldrawUiToolbarButton>
        <TldrawUiToolbarButton type="tool" className={styles.button} title="Strikethrough" aria-pressed={isActive('strike')}
          onPointerDown={(event) => event.preventDefault()} onClick={() => runTextAction((text) => { text.chain().toggleMark('strike').run() })}>
          <Strikethrough size={18} strokeWidth={2} aria-hidden="true" />
        </TldrawUiToolbarButton>
        <TextPopover id="board-text-link" open={linkOpen} onOpenChange={(open) => {
          setLinkOpen(open)
          if (open) {
            const href: unknown = textEditor ? textEditor.getAttributes('link').href : formatting.linkHref
            setLinkValue(typeof href === 'string' ? href : '')
          }
        }}>
          <TextPopoverTrigger>
            <TldrawUiToolbarButton type="tool" className={styles.button} title="Create link" aria-pressed={isActive('link')} onPointerDown={(event) => event.preventDefault()}>
              <Link size={18} strokeWidth={2} aria-hidden="true" />
            </TldrawUiToolbarButton>
          </TextPopoverTrigger>
          <TextPopoverContent>
            <form className={styles.linkForm} onSubmit={(event) => {
              event.preventDefault()
              if (!linkHref) return
              const value = linkValue.trim()
              runTextAction((text) => {
                const chain = text.chain().extendMarkRange('link')
                if (text.state.selection.empty && !text.isActive('link')) {
                  chain.insertContent({ type: 'text', text: value, marks: [{ type: 'link', attrs: { href: linkHref } }] }).run()
                } else chain.setMark('link', { href: linkHref }).run()
              })
              setLinkOpen(false)
              finishChoice()
            }}>
              <Input className={styles.linkInput} autoFocus aria-label="Link URL" placeholder="https://example.com" value={linkValue} onChange={(event) => setLinkValue(event.target.value)} />
              <div className={styles.linkActions}>
                {isActive('link') && <Button type="button" size="icon-xs" variant="ghost" title="Remove link" aria-label="Remove link" onClick={() => {
                  runTextAction((text) => { text.chain().extendMarkRange('link').unsetMark('link').run() })
                  setLinkOpen(false)
                  finishChoice()
                }}><Unlink size={16} aria-hidden="true" /></Button>}
                <Button type="submit" size="icon-xs" title="Apply link" aria-label="Apply link" disabled={!linkHref}><Check size={16} aria-hidden="true" /></Button>
              </div>
            </form>
          </TextPopoverContent>
        </TextPopover>
        <TldrawUiToolbarButton type="tool" className={styles.button} title="Bulleted list" aria-pressed={isActive('bulletList')}
          onPointerDown={(event) => event.preventDefault()} onClick={() => runTextAction((text) => { text.chain().toggleList('bulletList', 'listItem').run() })}>
          <List size={18} strokeWidth={2} aria-hidden="true" />
        </TldrawUiToolbarButton>
      </TldrawUiToolbar>
      <TldrawUiToolbar className={styles.group} label="Text alignment">
        <Choice id="board-text-align" label="Text alignment" trigger={<AlignmentIcon size={18} strokeWidth={2} aria-hidden="true" />}>
          <TldrawUiToolbar className={styles.menu} label="Text alignment">
            {alignments.map(({ value, label, icon: Icon }) => (
              <TldrawUiToolbarButton key={value} type="tool" className={styles.button} title={label} aria-pressed={shape.props.textAlign === value}
                onPointerDown={(event) => event.preventDefault()} onClick={() => {
                  editor.updateShape({ id: shape.id, type: 'text', props: { textAlign: value } })
                  finishChoice()
                }}><Icon size={18} strokeWidth={2} aria-hidden="true" /></TldrawUiToolbarButton>
            ))}
          </TldrawUiToolbar>
        </Choice>
      </TldrawUiToolbar>
    </div>,
    editor.getContainer(),
  )
}
