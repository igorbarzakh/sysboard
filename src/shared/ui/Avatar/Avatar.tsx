'use client'

import Image from 'next/image'
import { getInitials, getColorIndex } from './avatarUtils'
import styles from './Avatar.module.scss'

interface AvatarProps {
  name: string | null
  image: string | null
  size?: 'sm' | 'md' | 'lg'
}

const IMAGE_SIZES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: '24px',
  md: '32px',
  lg: '40px',
}

export function Avatar({ name, image, size = 'md' }: AvatarProps) {
  if (image) {
    return (
      <div className={styles.avatar} data-size={size}>
        <Image
          src={image}
          alt={name ?? 'User avatar'}
          fill
          sizes={IMAGE_SIZES[size]}
          className={styles.image}
        />
      </div>
    )
  }

  const colorIndex = getColorIndex(name)

  return (
    <div className={styles.avatar} data-size={size} data-color={colorIndex}>
      <span className={styles.initials}>{getInitials(name)}</span>
    </div>
  )
}
