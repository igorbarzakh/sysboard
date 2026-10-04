import type { TLRichText } from 'tldraw'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function getTextFormatting(richText: TLRichText) {
  const runs: { bold: boolean; strike: boolean; link: boolean; bulletList: boolean; href: string }[] = []

  const visit = (value: unknown, inBulletList = false) => {
    if (!isRecord(value)) return
    const bulletList = inBulletList || value.type === 'bulletList'
    if (value.type === 'text' && typeof value.text === 'string' && value.text.length > 0) {
      const marks = Array.isArray(value.marks) ? value.marks.filter(isRecord) : []
      const link = marks.find((mark) => mark.type === 'link')
      const href = isRecord(link?.attrs) && typeof link.attrs.href === 'string' ? link.attrs.href : ''
      runs.push({
        bold: marks.some((mark) => mark.type === 'bold'),
        strike: marks.some((mark) => mark.type === 'strike'),
        link: !!link,
        bulletList,
        href,
      })
    }
    if (Array.isArray(value.content)) value.content.forEach((child) => visit(child, bulletList))
  }

  visit(richText)
  const all = (key: 'bold' | 'strike' | 'link' | 'bulletList') => runs.length > 0 && runs.every((run) => run[key])
  const link = all('link')
  return {
    bold: all('bold'),
    strike: all('strike'),
    link,
    bulletList: all('bulletList'),
    linkHref: link && runs.every((run) => run.href === runs[0].href) ? runs[0].href : '',
  }
}
