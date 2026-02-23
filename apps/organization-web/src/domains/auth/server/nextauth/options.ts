// authOptions.ts
import { type NextAuthOptions } from 'next-auth';
import { callbacks } from './callbacks';
import { providers } from './providers';
import env from '@/config/env';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 2 * 60 * 60 },
  pages: { signIn: '/login', error: '/api/auth/error' },
  providers,
  callbacks,
  secret: env.NEXTAUTH_SECRET,
};
