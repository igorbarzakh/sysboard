const AVATAR_COLOR_COUNT = 6

export function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function getColorIndex(name: string | null): number {
  if (!name) return 0
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return hash % AVATAR_COLOR_COUNT
}
