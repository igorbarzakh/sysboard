'use client'

const SIZE_CLASSES = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
} as const

interface AvatarProps {
  name: string | null
  image: string | null
  size?: keyof typeof SIZE_CLASSES
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function Avatar({ name, image, size = 'md' }: AvatarProps) {
  const sizeClass = SIZE_CLASSES[size]
  const baseClass = `${sizeClass} rounded-full shrink-0 flex items-center justify-center overflow-hidden border border-border-subtle`

  if (image) {
    return (
      <div className={baseClass}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name ?? 'User avatar'}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className={`${baseClass} bg-accent-dim text-text-accent font-semibold`}>
      {getInitials(name)}
    </div>
  )
}
