import { type NextAuthOptions } from 'next-auth';
import { callbacks } from './callbacks';
import { providers } from './providers';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 2 * 60 * 60 },
  pages: { signIn: '/login', error: '/api/auth/error' },
  providers,
  callbacks,
  secret: process.env.NEXTAUTH_SECRET,
};
