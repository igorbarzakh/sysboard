import { CreateBoardButton } from '@features/create-board/ui'
import type { WorkspaceBoard } from '@entities/workspace/model'
import styles from './BoardListEmpty.module.scss'

interface BoardListEmptyProps {
  workspaceSlug: string
  boardCount: number
  onCreated: (b: WorkspaceBoard) => void
}

export function BoardListEmpty({ workspaceSlug, boardCount, onCreated }: BoardListEmptyProps) {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true">
          <rect x="2" y="2" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="16" y="2" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="9" y="19" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M7 9v4.5M21 9v4.5M7 13.5C7 13.5 14 18 21 13.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M14 13.5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className={styles.text}>
        <p className={styles.title}>No boards yet</p>
        <p className={styles.subtitle}>Create your first board to start designing</p>
      </div>
      <CreateBoardButton
        workspaceSlug={workspaceSlug}
        boardCount={boardCount}
        onSuccess={onCreated}
      />
    </div>
  )
}
