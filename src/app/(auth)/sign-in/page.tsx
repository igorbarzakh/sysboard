'use client'

import { signIn } from 'next-auth/react'

export default function SignInPage() {
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-xl)',
        padding: 'var(--sp-8)',
        width: '100%',
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--sp-6)',
        boxShadow: 'var(--shadow-elevated)',
      }}
    >
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        <span
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}
        >
          S<span style={{ color: 'var(--accent)' }}>D</span>B
        </span>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>
          Sign in to continue
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', width: '100%' }}>
        <button
          onClick={() => signIn('github')}
          style={{
            width: '100%',
            padding: 'var(--sp-3) var(--sp-4)',
            fontSize: 'var(--text-base)',
            fontWeight: 500,
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--r-md)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          Continue with GitHub
        </button>

        <button
          onClick={() => signIn('google')}
          style={{
            width: '100%',
            padding: 'var(--sp-3) var(--sp-4)',
            fontSize: 'var(--text-base)',
            fontWeight: 500,
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--r-md)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          Continue with Google
        </button>
      </div>
    </div>
  )
}
