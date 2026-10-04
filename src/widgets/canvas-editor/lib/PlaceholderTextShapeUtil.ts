import { cloneElement, createElement } from 'react'
import { TextShapeUtil, Vec, type TLTextShape, type SvgExportContext } from 'tldraw'
import { getTextColor } from './textPalette'
import { TextSelectionLabel } from '../ui/TextSelectionLabel/TextSelectionLabel'
import { getEmptyTextHeight, TEXT_FIELD_OUTLINE_WIDTH, TEXT_PLACEHOLDER, TEXT_PLACEHOLDER_FONT_SIZE } from './textPlaceholder'

export class PlaceholderTextShapeUtil extends TextShapeUtil {
  override component(shape: TLTextShape) {
    const label = super.component(shape)
    return createElement(TextSelectionLabel, { shapeId: shape.id },
      cloneElement(label, { labelColor: getTextColor(shape).hex }))
  }

  override toSvg(shape: TLTextShape, ctx: SvgExportContext) {
    return cloneElement(super.toSvg(shape, ctx), { labelColor: getTextColor(shape).hex })
  }

  override onBeforeCreate(shape: TLTextShape) {
    if (!this.editor.isIn('text.pointing') || this.getText(shape) !== '') {
      return
    }

    const props: TLTextShape['props'] = { ...shape.props, color: 'black', font: 'sans', size: 's' }
    if (!props.autoSize) return { ...shape, props }

    const outline = TEXT_FIELD_OUTLINE_WIDTH / this.editor.getZoomLevel()
    const height = getEmptyTextHeight(this.editor, props.font, props.size)
    const offset = new Vec(outline, outline + height / 2)
      .rot(-this.editor.getShapeParentTransform(shape).rotation())

    return {
      ...shape,
      x: shape.x + offset.x,
      y: shape.y + offset.y,
      props: { ...props, textAlign: 'start' as const, scale: 1 },
    }
  }

  override getMinDimensions(shape: TLTextShape) {
    const dimensions = super.getMinDimensions(shape)
    if (this.getText(shape) !== '') return dimensions

    const placeholder = this.editor.textMeasure.measureText(TEXT_PLACEHOLDER, {
      fontFamily: 'var(--tl-font-sans)',
      fontSize: TEXT_PLACEHOLDER_FONT_SIZE,
      fontWeight: '400',
      fontStyle: 'normal',
      lineHeight: 1,
      padding: '0px',
      maxWidth: null,
    })

    return {
      width: Math.max(dimensions.width, Math.ceil(placeholder.w) + 1),
      height: Math.max(dimensions.height, Math.ceil(placeholder.h)),
    }
  }
}
