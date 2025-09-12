import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { encryptString } from "@/lib/crypto";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
          access_type: "offline",
          prompt: "consent",
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = (user as any).id;
        (session.user as any).role = (user as any).role ?? null;
      }
      return session;
    },
  },
  events: {
    async linkAccount({ user, account }) {
      if (account?.provider === "google" && account.refresh_token) {
        const encrypted = encryptString(account.refresh_token);
        await (prisma as any).seller.upsert({
          where: { userId: (user as any).id },
          update: { encryptedRefresh: encrypted },
          create: { userId: (user as any).id, encryptedRefresh: encrypted },
        });
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

export function getServerAuthSession() {
  return getServerSession(authOptions);
}
