'use client'

import { Button as ButtonPrimitive } from '@base-ui/react/button'
import styles from './Button.module.scss'

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'

interface ButtonProps extends ButtonPrimitive.Props {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

export function Button({
  variant = 'default',
  size = 'default',
  className,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={[styles.button, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}
