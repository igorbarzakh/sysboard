import { useLayoutEffect, useState, type ReactNode } from 'react'
import { useEditor, useValue, type TLShapeId } from 'tldraw'
import styles from './TextSelectionLabel.module.scss'

export function TextSelectionLabel({ shapeId, children }: { shapeId: TLShapeId; children?: ReactNode }) {
  const editor = useEditor()
  const textEditor = useValue('text selection editor', () =>
    editor.getEditingShapeId() === shapeId ? editor.getRichTextEditor() : null, [editor, shapeId])
  const [fullySelected, setFullySelected] = useState(false)

  useLayoutEffect(() => {
    if (!textEditor || textEditor.isDestroyed) return
    const update = () => {
      const { doc, selection } = textEditor.state
      setFullySelected(!selection.empty &&
        doc.textBetween(0, selection.from) === '' &&
        doc.textBetween(selection.to, doc.content.size) === '')
    }
    update()
    textEditor.on('transaction', update)
    return () => { textEditor.off('transaction', update) }
  }, [textEditor])

  return <div className={styles.root} data-text-fully-selected={!!textEditor && fullySelected}>{children}</div>
}
