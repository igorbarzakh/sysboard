import { CreateBoardButton } from '@features/create-board/ui'
import styles from './BoardListEmpty.module.scss'

interface BoardListEmptyProps {
  boardCount: number
  boardLimit: number
  workspaceSlug: string
}

export function BoardListEmpty({
  boardCount,
  boardLimit,
  workspaceSlug,
}: BoardListEmptyProps) {
  return (
    <section className={styles.empty} aria-labelledby="boards-empty-title">
      <div className={styles.content}>
        <div className={styles.text}>
          <h2 id="boards-empty-title" className={styles.title}>
            Empty workspace
          </h2>
          <p className={styles.subtitle}>
            Create a new board to start working.
          </p>
        </div>

        <CreateBoardButton
          boardCount={boardCount}
          limit={boardLimit}
          workspaceSlug={workspaceSlug}
        />
      </div>
    </section>
  )
}
