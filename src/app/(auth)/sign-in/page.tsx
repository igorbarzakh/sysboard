'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Card, CardContent } from '@/shared/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { registerUser } from '@/features/register'

// ─── Shared sub-components ────────────────────────────────────────────────────

function FieldGroup({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
      <label
        htmlFor={htmlFor}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          color: 'var(--text-primary)',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        padding: 'var(--sp-2) var(--sp-3)',
        borderRadius: 'var(--r-md)',
        background: 'rgba(220,38,38,0.07)',
        border: '1px solid rgba(220,38,38,0.2)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: '#dc2626',
        lineHeight: 1.4,
      }}
    >
      {message}
    </div>
  )
}

function Divider() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-3)',
      }}
    >
      <div style={{ flex: 1, height: 1, background: 'var(--border-faint)' }} />
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        or
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-faint)' }} />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function GoogleButton() {
  return (
    <Button
      variant="outline"
      onClick={() => signIn('google', { callbackUrl: '/' })}
      style={{
        width: '100%',
        height: 38,
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        fontWeight: 500,
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--sp-2)',
        cursor: 'pointer',
        border: '1px solid var(--border-default)',
      }}
    >
      <GoogleIcon />
      Continue with Google
    </Button>
  )
}

// ─── Sign-in form ─────────────────────────────────────────────────────────────

function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError('Invalid email or password. Please try again.')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}
    >
      <FieldGroup label="Email" htmlFor="signin-email">
        <Input
          id="signin-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
        />
      </FieldGroup>

      <FieldGroup label="Password" htmlFor="signin-password">
        <Input
          id="signin-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          autoComplete="current-password"
        />
      </FieldGroup>

      {error && <ErrorBanner message={error} />}

      <Button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          height: 38,
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: 'var(--sp-1)',
        }}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>

      <Divider />
      <GoogleButton />
    </form>
  )
}

// ─── Sign-up form ─────────────────────────────────────────────────────────────

function SignUpForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await registerUser({ name, email, password })
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError('Account created — please sign in.')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}
    >
      <FieldGroup label="Name" htmlFor="signup-name">
        <Input
          id="signup-name"
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          autoComplete="name"
        />
      </FieldGroup>

      <FieldGroup label="Email" htmlFor="signup-email">
        <Input
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
        />
      </FieldGroup>

      <FieldGroup label="Password" htmlFor="signup-password">
        <Input
          id="signup-password"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          disabled={loading}
          autoComplete="new-password"
        />
      </FieldGroup>

      {error && <ErrorBanner message={error} />}

      <Button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          height: 38,
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: 'var(--sp-1)',
        }}
      >
        {loading ? 'Creating account…' : 'Create account'}
      </Button>

      <Divider />
      <GoogleButton />
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuthPage() {
  return (
    <Card
      style={{
        width: '100%',
        maxWidth: 400,
        fontFamily: 'var(--font-body)',
      }}
    >
      <CardContent>
        <div style={{ padding: 'var(--sp-4) var(--sp-2) var(--sp-2)' }}>
          <Tabs
            defaultValue="signin"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}
          >
            <TabsList style={{ width: '100%' }}>
              <TabsTrigger value="signin" style={{ flex: 1, fontFamily: 'var(--font-body)' }}>
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" style={{ flex: 1, fontFamily: 'var(--font-body)' }}>
                Sign up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <SignInForm />
            </TabsContent>

            <TabsContent value="signup">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
