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
    <section className={styles.empty} aria-labelledby="boards-empty-title">
      <div className={styles.content}>
        <div className={styles.illustration} aria-hidden="true">
          <svg viewBox="0 0 200 118" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Back card */}
            <rect
              x="56" y="6" width="114" height="72" rx="11"
              className={styles.cardBack}
            />
            <rect x="74" y="22" width="48" height="5" rx="2.5" className={styles.skeletonDim} />
            <rect x="74" y="33" width="34" height="5" rx="2.5" className={styles.skeletonDim} />
            <rect x="74" y="50" width="62" height="5" rx="2.5" className={styles.skeletonDim} />
            <rect x="74" y="61" width="44" height="5" rx="2.5" className={styles.skeletonDim} />

            {/* Front card */}
            <rect
              x="30" y="28" width="114" height="72" rx="11"
              className={styles.cardFront}
            />
            {/* Icon area */}
            <rect x="44" y="42" width="24" height="24" rx="7" className={styles.iconArea} />
            {/* Tiny system diagram inside icon */}
            <rect x="50" y="48" width="6" height="5" rx="1.5" className={styles.iconNode} />
            <rect x="58" y="48" width="5" height="5" rx="1.5" className={styles.iconNode} />
            <rect x="54" y="55" width="5" height="5" rx="1.5" className={styles.iconNode} />
            <line x1="56" y1="51" x2="58" y2="51" className={styles.iconLine} />
            <line x1="56.5" y1="53" x2="56.5" y2="55" className={styles.iconLine} />

            {/* Text skeletons */}
            <rect x="76" y="46" width="50" height="5" rx="2.5" className={styles.skeleton} />
            <rect x="76" y="57" width="36" height="5" rx="2.5" className={styles.skeleton} />
            <rect x="44" y="80" width="88" height="5" rx="2.5" className={styles.skeleton} />
            <rect x="44" y="91" width="60" height="5" rx="2.5" className={styles.skeleton} />
          </svg>
        </div>

        <div className={styles.text}>
          <h2 id="boards-empty-title" className={styles.title}>Canvas is ready</h2>
          <p className={styles.subtitle}>Create your first board and start turning ideas into clear system diagrams.</p>
        </div>

        <CreateBoardButton
          workspaceSlug={workspaceSlug}
          boardCount={boardCount}
          onSuccess={onCreated}
        />
      </div>
    </section>
  )
}
