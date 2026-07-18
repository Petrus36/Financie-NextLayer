import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { resolveAuthSecret } from "@/lib/env";

const authSecret = resolveAuthSecret();

if (!authSecret && process.env.NODE_ENV === "production") {
  console.error(
    "AUTH_SECRET is missing. Add it in Vercel → Settings → Environment Variables."
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: authSecret,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) return null;

          const valid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Login failed:", error);
          return null;
        }
      },
    }),
  ],
});
