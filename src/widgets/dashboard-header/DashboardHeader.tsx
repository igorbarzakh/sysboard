'use client'

import { signOut } from 'next-auth/react'
import { useCurrentUser, Avatar } from '@/entities/user'

export function DashboardHeader() {
  const user = useCurrentUser()

  return (
    <header
      style={{
        height: 56,
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--sp-6)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
        }}
      >
        S<span style={{ color: 'var(--accent)' }}>D</span>B
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
        {user && (
          <>
            <Avatar name={user.name} image={user.image} size="sm" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {user.name ?? user.email}
            </span>
          </>
        )}

        <button
          onClick={() => signOut()}
          style={{
            padding: 'var(--sp-1) var(--sp-3)',
            fontSize: 'var(--text-sm)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--r-md)',
            background: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
