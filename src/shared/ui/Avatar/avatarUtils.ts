export function getInitials(name: string | null, maxParts = 2): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, maxParts)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
