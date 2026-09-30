import { DefaultColorThemePalette } from 'tldraw'

export const markerColors = [
  { value: 'black', hex: '#1E1E1E', label: 'Black' },
  { value: 'red', hex: '#F24822', label: 'Red' },
  { value: 'orange', hex: '#FF9E42', label: 'Orange' },
  { value: 'yellow', hex: '#FFC943', label: 'Yellow' },
  { value: 'green', hex: '#66D575', label: 'Green' },
  { value: 'blue', hex: '#3DADFF', label: 'Blue' },
  { value: 'violet', hex: '#874FFF', label: 'Violet' },
  { value: 'white', hex: '#FFFFFF', label: 'White' },
] as const

for (const theme of [DefaultColorThemePalette.lightMode, DefaultColorThemePalette.darkMode]) {
  for (const { value, hex } of markerColors) {
    theme[value].solid = hex
  }
}
