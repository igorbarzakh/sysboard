import { BoardList } from '@/widgets/board-list'

export default function DashboardPage() {
  return (
    <div
      style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: 'var(--sp-8)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-6)',
      }}
    >
      <h1
        style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}
      >
        Your Boards
      </h1>
      <BoardList />
    </div>
  )
}
