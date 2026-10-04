import { Editor as RichTextEditor, type JSONContent } from '@tiptap/core'
import { tipTapDefaultExtensions, type Editor, type TiptapEditor, type TLRichText } from 'tldraw'

export function applyTextFormatting(
  editor: Editor,
  richText: TLRichText,
  action: (textEditor: TiptapEditor) => void,
): TLRichText {
  const textEditor = new RichTextEditor({
    element: null,
    autofocus: false,
    enableCoreExtensions: { textDirection: false },
    textDirection: 'auto',
    extensions: editor.getTextOptions().tipTapConfig?.extensions ?? tipTapDefaultExtensions,
    content: richText as JSONContent,
  })
  try {
    textEditor.commands.selectAll()
    action(textEditor)
    return textEditor.state.doc.toJSON()
  } finally {
    textEditor.destroy()
  }
}
