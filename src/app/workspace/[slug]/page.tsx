import { BoardList } from '@widgets/board-list/ui'
import styles from './page.module.scss'

type PageProps = { params: Promise<{ slug: string }> }

export default async function WorkspacePage({ params }: PageProps) {
  const { slug } = await params

  return (
    <div className={styles.page}>
      <BoardList workspaceSlug={slug} />
    </div>
  )
}
