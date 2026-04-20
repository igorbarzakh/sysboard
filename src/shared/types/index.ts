import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      plan: string
      profileRole: string | null
      provider: string | null
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    plan: string
    profileRole: string | null
    provider: string | null
  }
}
