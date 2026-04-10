'use client'

import { signOut } from 'next-auth/react'
import { useCurrentUser } from '@/entities/user'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/shared/ui/avatar'

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function ChevronDownIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Logo */}
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lg)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          userSelect: 'none',
        }}
      >
        S<span style={{ color: 'var(--accent)' }}>D</span>B
      </span>

      {/* User controls */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sp-2)',
              background: 'none',
              border: '1px solid transparent',
              borderRadius: 'var(--r-md)',
              padding: 'var(--sp-1) var(--sp-2)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              transition: 'border-color 120ms, background 120ms',
            }}
          >
            <Avatar size="sm">
              <AvatarImage
                src={user.image ?? undefined}
                alt={user.name ?? 'User avatar'}
              />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>

            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: 'var(--text-primary)',
                maxWidth: 160,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.name ?? user.email}
            </span>

            <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
              <ChevronDownIcon />
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="bottom" align="end" sideOffset={6}>
            <div
              style={{
                padding: 'var(--sp-2) var(--sp-3)',
                borderBottom: '1px solid var(--border-faint)',
                marginBottom: 'var(--sp-1)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 200,
                }}
              >
                {user.name ?? 'User'}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 200,
                }}
              >
                {user.email}
              </p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/sign-in' })}
              style={{ fontFamily: 'var(--font-body)', cursor: 'pointer' }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  )
}
