import { DefaultColorThemePalette } from 'tldraw'

export const markerColors = [
  { value: 'black', hex: '#1E1E1E', border: '#1E1E1E', label: 'Black' },
  { value: 'red', hex: '#F24822', border: '#DA411F', label: 'Red' },
  { value: 'orange', hex: '#FF9E42', border: '#E48D3B', label: 'Orange' },
  { value: 'yellow', hex: '#FFC943', border: '#E6B43D', label: 'Yellow' },
  { value: 'green', hex: '#66D575', border: '#5CBF69', label: 'Green' },
  { value: 'blue', hex: '#3DADFF', border: '#359CE5', label: 'Blue' },
  { value: 'violet', hex: '#874FFF', border: '#7948E5', label: 'Violet' },
  { value: 'white', hex: '#FFFFFF', border: '#E5E5E5', label: 'White' },
] as const

for (const theme of [DefaultColorThemePalette.lightMode, DefaultColorThemePalette.darkMode]) {
  for (const { value, hex } of markerColors) {
    theme[value].solid = hex
  }
}
