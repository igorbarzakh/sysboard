import type { TLTextShape } from 'tldraw'

export const textColors = [
  { color: 'black', hex: '#1E1E1E', border: '#4B4B4B', label: 'Black' },
  { color: 'grey', hex: '#B3B3B3', border: '#C2C2C2', label: 'Gray' },
  { color: 'grey', hex: '#757575', border: '#919191', label: 'Dark gray' },
  { color: 'grey', hex: '#D9D9D9', border: '#4B4B4B', label: 'Light gray' },
  { color: 'red', hex: '#F34822', border: '#F77055', label: 'Red' },
  { color: 'light-red', hex: '#FFC7C2', border: '#FFD2CF', label: 'Light red' },
  { color: 'orange', hex: '#FF9E42', border: '#FFB26C', label: 'Orange' },
  { color: 'orange', hex: '#FFE0C2', border: '#FFE6CE', label: 'Light orange' },
  { color: 'yellow', hex: '#FFC942', border: '#FFD36D', label: 'Yellow' },
  { color: 'yellow', hex: '#FFECBD', border: '#FFF1CA', label: 'Light yellow' },
  { color: 'green', hex: '#66D575', border: '#88DD92', label: 'Green' },
  { color: 'light-green', hex: '#CDF4D2', border: '#D7F6DB', label: 'Light green' },
  { color: 'green', hex: '#5AD8CC', border: '#80DFD6', label: 'Teal' },
  { color: 'light-green', hex: '#C7FAF7', border: '#D2FAF9', label: 'Light teal' },
  { color: 'blue', hex: '#3CADFF', border: '#69BEFF', label: 'Blue' },
  { color: 'light-blue', hex: '#C2E5FF', border: '#CFEAFF', label: 'Light blue' },
  { color: 'violet', hex: '#874FFF', border: '#A073FF', label: 'Violet' },
  { color: 'light-violet', hex: '#DCCDFF', border: '#E3D7FF', label: 'Light violet' },
  { color: 'red', hex: '#F849C1', border: '#FB71CE', label: 'Pink' },
  { color: 'light-red', hex: '#FFC2EC', border: '#FFCEF0', label: 'Light pink' },
  { color: 'white', hex: '#FFFFFF', border: '#FFFFFF', label: 'White' },
  { color: 'white', hex: '#F7F7F9', border: '#F7F7F9', label: 'Bright white' },
] as const satisfies readonly { color: TLTextShape['props']['color']; hex: string; border: string; label: string }[]

export function getTextColor(shape: TLTextShape) {
  return textColors.find(({ hex }) => hex === shape.meta.textColor)
    ?? textColors.find(({ color }) => color === shape.props.color)
    ?? textColors[0]
}
