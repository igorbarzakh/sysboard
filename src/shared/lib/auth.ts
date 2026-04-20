import { type NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import DiscordProvider from 'next-auth/providers/discord'
import { importOAuthAvatar } from './avatarStorage'
import { deriveSlug } from './deriveSlug'
import { prisma } from './db'
import { getUpdatedSessionImage } from './nextAuthSession'

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
    async jwt({ token, user, trigger, session }) {
      const updatedImage = trigger === 'update' ? getUpdatedSessionImage(session) : null
      if (updatedImage) {
        token.picture = updatedImage
      }

      if (user) {
        token.id = user.id
        token.picture = user.image
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { plan: true },
        })
        token.plan = dbUser?.plan ?? 'free'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id
        session.user.plan = token.plan
        if (typeof token.picture === 'string') {
          session.user.image = token.picture
        }
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
            plan: 'free',
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
