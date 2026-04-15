import styles from './BoardNamePanel.module.scss'

interface BoardNamePanelProps {
  name: string
}

export function BoardNamePanel({ name }: BoardNamePanelProps) {
  return <div className={styles.panel}>{name}</div>
}
