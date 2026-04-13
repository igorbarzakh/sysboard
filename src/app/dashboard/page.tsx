import { BoardList } from '@/widgets/board-list'

export default function DashboardPage() {
  return (
    <div className="max-w-240 mx-auto p-8 flex flex-col gap-6">
      <BoardList />
    </div>
  )
}
