'use client'

const SIZES = {
  sm: 24,
  md: 32,
  lg: 40,
} as const

interface AvatarProps {
  name: string | null
  image: string | null
  size?: keyof typeof SIZES
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
  const px = SIZES[size]
  const fontSize = px <= 24 ? 'var(--text-xs)' : px <= 32 ? 'var(--text-sm)' : 'var(--text-base)'

  const baseStyle: React.CSSProperties = {
    width: px,
    height: px,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    border: '1px solid var(--border-subtle)',
  }

  if (image) {
    return (
      <div style={baseStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name ?? 'User avatar'}
          width={px}
          height={px}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        ...baseStyle,
        background: 'var(--accent-dim)',
        color: 'var(--text-accent)',
        fontSize,
        fontWeight: 600,
      }}
    >
      {getInitials(name)}
    </div>
  )
}
