import env from '@/config/env';
import GoogleProvider from 'next-auth/providers/google';

export const google = GoogleProvider({
  clientId: env.OAUTH_CLIENT_ID || '',
  clientSecret: env.OAUTH_CLIENT_SECRET || '',
});

export async function handleGoogleSignIn(email?: string | null) {
  if (!email) return false;
  // const u = await authService.resolveGoogleUser(email);
  // return !!u;
  return false;
}
