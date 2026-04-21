import { Button } from '@shared/ui'
import styles from './DangerZone.module.scss'

interface DangerZoneProps {
  disabled: boolean
  onDeleteClick: () => void
}

export function DangerZone({ disabled, onDeleteClick }: DangerZoneProps) {
  return (
    <div className={styles.root}>
      <p className={styles.title}>Danger Zone</p>
      <p className={styles.subtitle}>
        Actions in this section are permanent and cannot be undone.
      </p>
      <Button
        type="button"
        variant="ghost"
        disabled={disabled}
        className={styles.button}
        onClick={onDeleteClick}
      >
        Delete Account
      </Button>
    </div>
  )
}
