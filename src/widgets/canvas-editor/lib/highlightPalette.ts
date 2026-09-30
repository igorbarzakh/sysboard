import { DefaultColorThemePalette } from 'tldraw'

export const highlightColors = [
  { value: 'light-red', hex: '#FF99F8', label: 'Pink' },
  { value: 'orange', hex: '#FFAE4F', label: 'Orange' },
  { value: 'yellow', hex: '#FFEE00', label: 'Yellow' },
  { value: 'light-green', hex: '#86FA16', label: 'Green' },
  { value: 'light-blue', hex: '#6FFFF6', label: 'Blue' },
  { value: 'light-violet', hex: '#B38FFF', label: 'Violet' },
  { value: 'grey', hex: '#979797', label: 'Grey' },
  { value: 'white', hex: '#FFFFFF', label: 'White' },
] as const

// Customize only highlight strokes; ordinary shapes retain their existing colors.
for (const theme of [DefaultColorThemePalette.lightMode, DefaultColorThemePalette.darkMode]) {
  for (const { value, hex } of highlightColors) {
    theme[value].highlightSrgb = hex
    theme[value].highlightP3 = hex
  }
}
