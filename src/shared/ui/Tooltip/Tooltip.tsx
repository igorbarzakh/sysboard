'use client'

import * as React from 'react'
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import { TooltipArrow } from './TooltipArrow'
import styles from './Tooltip.module.scss'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: TooltipPrimitive.Positioner.Props['side']
  delay?: number
  trigger?: 'hover' | 'click'
}

export function Tooltip({
  content,
  children,
  side = 'top',
  delay = 300,
  trigger = 'hover',
}: TooltipProps) {
  const [open, setOpen] = React.useState(false)

  const handleOpenChange: TooltipPrimitive.Root.Props['onOpenChange'] = (
    next,
    eventDetails,
  ) => {
    if (trigger === 'click') {
      const reason = eventDetails?.reason
      if (reason === 'outside-press' || reason === 'escape-key') {
        setOpen(false)
      }
    } else {
      setOpen(next)
    }
  }

  const handleClick = () => {
    if (trigger === 'click') setOpen((prev) => !prev)
  }

  return (
    <TooltipPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <TooltipPrimitive.Trigger
        delay={trigger === 'click' ? 999999 : delay}
        closeOnClick={false}
        render={
          <span
            className={styles.trigger}
            data-trigger={trigger}
            onClick={handleClick}
          />
        }
      >
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner
          side={side}
          sideOffset={8}
          className={styles.positioner}
        >
          <TooltipPrimitive.Popup className={styles.popup}>
            <span className={styles.arrow}>
              <TooltipArrow />
            </span>
            {content}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
