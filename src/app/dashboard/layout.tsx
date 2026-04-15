import { DashboardHeader } from '@widgets/dashboard-header/ui'
import styles from './layout.module.scss'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root}>
      <DashboardHeader />
      <div className={styles.body}>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}
