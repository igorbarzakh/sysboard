import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { customAlphabet } from "nanoid";
import { prisma } from "@/shared/lib/db";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 4);

function deriveSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 46) +
    "-" +
    nanoid()
  );
}

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
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { plan: true },
        });
        token.plan = dbUser?.plan ?? "free";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.plan = token.plan;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      const workspaceName = `${user.name ?? "My"}'s Workspace`;
      const workspace = await prisma.workspace.create({
        data: {
          name: workspaceName,
          slug: deriveSlug(workspaceName),
          ownerId: user.id,
          plan: "free",
          members: {
            create: { userId: user.id, role: "owner" },
          },
        },
      });
      console.log(`[auth] Created default workspace "${workspace.name}" for new user ${user.id}`);
    },
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },
  pages: {
    signIn: "/",
  },
};
