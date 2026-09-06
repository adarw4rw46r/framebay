import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

const DEV_EMAIL = process.env.DEV_USER_EMAIL?.trim().toLowerCase();
const DEV_PASSWORD = process.env.DEV_USER_PASSWORD;

async function ensureDevUser() {
  if (!DEV_EMAIL || !DEV_PASSWORD) return null;
  const existing = await prisma.user.findUnique({ where: { email: DEV_EMAIL } });
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  return prisma.user.create({
    data: {
      email: DEV_EMAIL,
      name: "Dev Creator",
      passwordHash,
    },
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        if (DEV_EMAIL && DEV_PASSWORD && email === DEV_EMAIL) {
          await ensureDevUser();
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
});
