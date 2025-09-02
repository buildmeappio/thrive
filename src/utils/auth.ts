import NextAuth, {
  type NextAuthOptions,
  type DefaultSession,
  type User,
} from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/shared/lib/prisma";
import type { Role } from "@prisma/client";
import type { Prisma } from "@prisma/client";

// 🔹 Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      phone: string | null;
      gender: string | null;
      dateOfBirth: Date | null;
      role: Role | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    gender: string | null;
    dateOfBirth: Date | null;
    role: Role | null;
    password?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    gender: string | null;
    dateOfBirth: Date | null;
    role: Role | null;
  }
}

// 🔹 Infer user type from Prisma query
type UserWithRole = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    password: true;
    firstName: true;
    lastName: true;
    phone: true;
    gender: true;
    dateOfBirth: true;
    accounts: { include: { role: true } };
  };
}>;

const authorize = async (
  credentials: Record<"email" | "password", string> | undefined
): Promise<User | null> => {
  if (!credentials?.email || !credentials?.password) return null;

  const user = await prisma.user.findUnique({
    where: { email: credentials.email.toLowerCase(), deletedAt: null },
    select: {
      id: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      phone: true,
      gender: true,
      dateOfBirth: true,
      accounts: { include: { role: true } },
    },
  });

  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    user.password
  );
  if (!isPasswordValid) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    role: user.accounts[0]?.role || null,
  };
};

// 🔹 Callbacks
const jwt: NonNullable<NextAuthOptions["callbacks"]>["jwt"] = async ({
  token,
  user,
}) => {
  if (user) {
    token.id = user.id;
    token.email = user.email;
    token.firstName = user.firstName;
    token.lastName = user.lastName;
    token.phone = user.phone;
    token.gender = user.gender;
    token.dateOfBirth = user.dateOfBirth;
    token.role = user.role;
  }
  return token;
};

const session: NonNullable<NextAuthOptions["callbacks"]>["session"] = async ({
  session,
  token,
}) => {
  if (session.user) {
    session.user.id = token.id;
    session.user.email = token.email;
    session.user.firstName = token.firstName;
    session.user.lastName = token.lastName;
    session.user.phone = token.phone;
    session.user.gender = token.gender;
    session.user.dateOfBirth = token.dateOfBirth;
    session.user.role = token.role;
  }
  return session;
};

// 🔹 Auth options
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/api/auth/error" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize,
    }),
  ],
  callbacks: { jwt, session },
  secret: process.env.NEXTAUTH_SECRET,
};

// 🔹 Export handler directly
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export const getServerAuthSession = () => getServerSession(authOptions);
