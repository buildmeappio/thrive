import KeycloakProvider from 'next-auth/providers/keycloak';

export const keycloak = KeycloakProvider({
  clientId: process.env.KEYCLOAK_CLIENT_ID || '',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
  issuer: process.env.KEYCLOAK_ISSUER || '',
});
