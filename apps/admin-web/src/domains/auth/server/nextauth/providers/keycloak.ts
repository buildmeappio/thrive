import KeycloakProvider from 'next-auth/providers/keycloak';
import * as authService from '@/domains/auth/server/auth.service';

export const keycloak = KeycloakProvider({
  clientId: process.env.KEYCLOAK_CLIENT_ID || '',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
  issuer: process.env.KEYCLOAK_ISSUER || '',
});

export async function handleKeycloakSignIn(email?: string | null) {
  if (!email) return false;
  const u = await authService.resolveGoogleUser(email); // Reuse same logic as Google
  return !!u;
}
