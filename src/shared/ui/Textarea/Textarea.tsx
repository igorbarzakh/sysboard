import * as React from 'react'
import styles from './Textarea.module.scss'

export function Textarea({
  className,
  ...props
}: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={[styles.textarea, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}
