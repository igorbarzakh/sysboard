import { BoardList } from '@widgets/board-list/ui'
import styles from './WorkspaceOverviewPage.module.scss'

interface WorkspaceOverviewPageProps {
  currentUserId: string
  workspaceSlug: string
}

export function WorkspaceOverviewPage({
  currentUserId,
  workspaceSlug,
}: WorkspaceOverviewPageProps) {
  return (
    <div className={styles.page}>
      <BoardList currentUserId={currentUserId} workspaceSlug={workspaceSlug} />
    </div>
  )
}
