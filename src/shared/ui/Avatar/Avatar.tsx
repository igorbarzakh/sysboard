'use client'

import Image from 'next/image'
import { getInitials } from './avatarUtils'
import styles from './Avatar.module.scss'

type AvatarColor = 'default' | 'green' | 'blue' | 'orange' | 'red' | 'purple'

interface AvatarProps {
  color?: AvatarColor
  eager?: boolean
  initialsLength?: 1 | 2
  name: string | null
  image: string | null
  shape?: 'circle' | 'rounded'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const IMAGE_SIZES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: '24px',
  md: '32px',
  lg: '40px',
  xl: '96px',
}

export function Avatar({
  color = 'default',
  eager = false,
  initialsLength = 2,
  name,
  image,
  shape = 'circle',
  size = 'md',
}: AvatarProps) {
  if (image) {
    return (
      <div className={styles.avatar} data-shape={shape} data-size={size}>
        <Image
          src={image}
          alt={name ?? 'Avatar'}
          fill
          sizes={IMAGE_SIZES[size]}
          className={styles.image}
          fetchPriority={eager ? 'high' : undefined}
          loading={eager ? 'eager' : undefined}
          unoptimized
        />
      </div>
    )
  }

  return (
    <div
      className={styles.avatar}
      data-shape={shape}
      data-size={size}
      data-color={color}
    >
      <span className={styles.initials}>{getInitials(name, initialsLength)}</span>
    </div>
  )
}
