import type { RegisterFormData, RegisterError } from '../model/types'

export async function registerUser(data: RegisterFormData): Promise<void> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const body = (await res.json()) as RegisterError
    throw new Error(body.error ?? 'Registration failed')
  }
}
