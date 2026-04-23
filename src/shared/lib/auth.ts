import { type NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import DiscordProvider from 'next-auth/providers/discord'
import { importOAuthAvatar } from './avatarStorage'
import { deriveSlug } from './deriveSlug'
import { prisma } from './db'
import { getUpdatedSessionUser } from './nextAuthSession'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      const updatedUser = trigger === 'update' ? getUpdatedSessionUser(session) : {}
      if ('image' in updatedUser) {
        token.picture = updatedUser.image ?? null
      }
      if ('name' in updatedUser) {
        token.name = updatedUser.name
      }
      if ('profileRole' in updatedUser) {
        token.profileRole = updatedUser.profileRole ?? null
      }

      if (user) {
        token.id = user.id
        token.picture = user.image
        token.name = user.name
        const [dbUser, dbAccount] = await Promise.all([
          prisma.user.findUnique({
            where: { id: user.id },
            select: { plan: true, profileRole: true },
          }),
          Promise.resolve(account?.provider ?? null),
        ])
        token.plan = dbUser?.plan ?? 'free'
        token.profileRole = dbUser?.profileRole ?? null
        token.provider = dbAccount
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id
        session.user.plan = token.plan
        session.user.profileRole =
          typeof token.profileRole === 'string' ? token.profileRole : null
        session.user.name = typeof token.name === 'string' ? token.name : null
        if (typeof token.picture === 'string') {
          session.user.image = token.picture
        }
        session.user.provider = typeof token.provider === 'string' ? token.provider : null
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      const existing = await prisma.workspace.findFirst({ where: { ownerId: user.id } })
      if (!existing) {
        const workspaceName = `${user.name ?? 'My'}'s Workspace`
        await prisma.workspace.create({
          data: {
            name: workspaceName,
            slug: deriveSlug(),
            ownerId: user.id,
            members: {
              create: { userId: user.id, role: 'owner' },
            },
          },
        })
      }

      try {
        const image = await importOAuthAvatar(user.id, user.image)
        if (image) {
          await prisma.user.update({
            where: { id: user.id },
            data: { image },
          })
          user.image = image
        }
      } catch {
        console.error('Avatar import failed')
      }
    },
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
  },
  pages: {
    signIn: '/',
  },
}
