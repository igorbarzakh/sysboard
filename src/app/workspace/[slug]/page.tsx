import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib'
import { BoardList } from '@widgets/board-list/ui'
import styles from './page.module.scss'

type PageProps = { params: Promise<{ slug: string }> }

export default async function WorkspacePage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  const { slug } = await params

  return (
    <div className={styles.page}>
      <BoardList currentUserId={session.user.id} workspaceSlug={slug} />
    </div>
  )
}
