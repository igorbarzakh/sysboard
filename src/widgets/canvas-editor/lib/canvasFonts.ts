import { DefaultFontFaces } from 'tldraw'

const fontFiles = {
  tldraw_sans: { normal: 'Inter.ttf', italic: 'Inter-Italic.ttf' },
  tldraw_serif: { normal: 'Literata.ttf', italic: 'Literata-Italic.ttf' },
  tldraw_mono: { normal: 'JetBrainsMono.ttf', italic: 'JetBrainsMono-Italic.ttf' },
  tldraw_draw: { normal: 'Caveat.ttf', italic: 'Caveat.ttf' },
} as const

export const canvasFontUrls: Record<string, string> = {}

for (const family of Object.keys(fontFiles) as (keyof typeof fontFiles)[]) {
  for (const style of ['normal', 'italic'] as const) {
    for (const face of Object.values(DefaultFontFaces[family][style])) {
      canvasFontUrls[face.src.url] = `/fonts/canvas/${fontFiles[family][style]}`
      // Keep tldraw's family aliases and provide the correct format for SVG exports.
      face.src.format = 'truetype'
    }
  }
}
