import NextAuth from 'next-auth'
import { authOptions } from '@shared/lib'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
