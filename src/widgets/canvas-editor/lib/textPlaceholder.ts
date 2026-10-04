import {
  FONT_FAMILIES,
  FONT_SIZES,
  TEXT_PROPS,
  renderHtmlFromRichTextForMeasurement,
  toRichText,
  type Editor,
  type TLDefaultFontStyle,
  type TLDefaultSizeStyle,
} from 'tldraw'

export const TEXT_PLACEHOLDER = 'Add text'
export const TEXT_PLACEHOLDER_FONT_SIZE = 18
export const TEXT_FIELD_OUTLINE_WIDTH = 2

export function getEmptyTextHeight(editor: Editor, font: TLDefaultFontStyle, size: TLDefaultSizeStyle) {
  const measured = editor.textMeasure.measureHtml(
    renderHtmlFromRichTextForMeasurement(editor, toRichText('')),
    { ...TEXT_PROPS, fontFamily: FONT_FAMILIES[font], fontSize: FONT_SIZES[size], maxWidth: null },
  )
  return Math.max(FONT_SIZES[size], measured.h)
}
