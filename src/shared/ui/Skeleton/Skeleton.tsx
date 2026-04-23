import type { HTMLAttributes } from 'react'
import styles from './Skeleton.module.scss'

type SkeletonVariant = 'block' | 'circle'

interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: SkeletonVariant
}

export function Skeleton({
  className,
  variant = 'block',
  ...props
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={[styles.skeleton, className].filter(Boolean).join(' ')}
      data-variant={variant}
      {...props}
    />
  )
}
