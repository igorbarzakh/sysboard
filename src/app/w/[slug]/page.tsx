import { BoardList } from '@/widgets/board-list'

type PageProps = { params: Promise<{ slug: string }> }

export default async function WorkspacePage({ params }: PageProps) {
  const { slug } = await params

  return (
    <div className="p-8 flex flex-col gap-6">
      <BoardList workspaceSlug={slug} />
    </div>
  )
}
