import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'
import styles from './Input.module.scss'

export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={[styles.input, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}
