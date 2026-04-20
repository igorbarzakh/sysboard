import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions, PLAN_LIMITS, prisma } from '@shared/lib'
import type { UserPlan } from '@shared/lib'

type PageProps = { searchParams: Promise<{ workspace?: string; n?: string }> }

export default async function NewBoardPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  const { workspace: slug, n } = await searchParams
  if (!slug) redirect('/')

  const workspace = await prisma.workspace.findFirst({
    where: { slug, members: { some: { userId: session.user.id } } },
    select: { id: true, plan: true, slug: true },
  })
  if (!workspace) redirect('/')

  const plan = workspace.plan as UserPlan
  const limit = PLAN_LIMITS[plan].maxBoardsPerWorkspace
  const boardCount = await prisma.board.count({ where: { workspaceId: workspace.id } })
  if (boardCount >= limit) redirect(`/workspace/${workspace.slug}`)

  const name = `Untitled board ${n ?? boardCount + 1}`

  const board = await prisma.board.create({
    data: {
      name,
      workspaceId: workspace.id,
      members: { create: { userId: session.user.id, role: 'editor' } },
    },
    select: { id: true },
  })

  redirect(`/board/${board.id}`)
}
