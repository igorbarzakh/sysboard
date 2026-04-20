'use client'

import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-react'
import { Toaster as SonnerToaster } from 'sonner'
import styles from './Toaster.module.scss'

const icons = {
  success: <CircleCheck size={16} className={styles.iconSuccess} />,
  error: <CircleX size={16} className={styles.iconError} />,
  info: <Info size={16} className={styles.iconInfo} />,
  warning: <TriangleAlert size={16} className={styles.iconWarning} />,
}

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      className={styles.toaster}
      icons={icons}
    />
  )
}
