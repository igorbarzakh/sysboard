import { BoardList } from '@widgets/board-list/ui'
import styles from './WorkspaceOverviewPage.module.scss'

interface WorkspaceOverviewPageProps {
  boardLimit: number
  currentUserId: string
  workspaceSlug: string
}

export function WorkspaceOverviewPage({
  boardLimit,
  currentUserId,
  workspaceSlug,
}: WorkspaceOverviewPageProps) {
  return (
    <div className={styles.page}>
      <BoardList
        boardLimit={boardLimit}
        currentUserId={currentUserId}
        workspaceSlug={workspaceSlug}
      />
    </div>
  )
}
