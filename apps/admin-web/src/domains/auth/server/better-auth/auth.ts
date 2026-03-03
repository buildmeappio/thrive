import 'server-only';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { genericOAuth } from 'better-auth/plugins';
import masterDb from '@thrive/database-master/db';

/**
 * Better Auth configuration for admin-web (multi-tenant).
 *
 * Key differences from central-web:
 * - Uses master DB for auth storage (like central-web)
 * - Tenant validation happens in middleware/session utilities
 * - Handles subdomain-based tenant routing
 * - Communicates with central-web through shared Keycloak sessions
 *
 * Note: Tenant-specific user data (role, accountId) is enriched in middleware
 * or session utilities, not in the auth config itself.
 */
export const auth = betterAuth({
  database: prismaAdapter(masterDb, {
    provider: 'postgresql',
  }),

  secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET!,
  baseURL:
    (process.env.BETTER_AUTH_URL ||
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000') + '/api/auth-better',

  // Admin portal session — stores keycloakSub for tenant validation
  user: {
    additionalFields: {
      keycloakSub: {
        type: 'string',
        required: false,
        unique: true,
        input: false,
      },
      firstName: {
        type: 'string',
        required: false,
        input: false,
      },
      lastName: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },

  plugins: [
    genericOAuth({
      config: [
        {
          providerId: 'keycloak',
          discoveryUrl: `${process.env.KEYCLOAK_ISSUER}/.well-known/openid-configuration`,
          clientId: process.env.KEYCLOAK_CLIENT_ID!,
          clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
          scopes: ['openid', 'profile', 'email'],
          requireIssuerValidation: true,

          mapProfileToUser: async (profile: Record<string, string>) => ({
            name: profile.name || `${profile.given_name ?? ''} ${profile.family_name ?? ''}`.trim(),
            email: profile.email,
            image: profile.picture ?? null,
            keycloakSub: profile.sub,
            firstName: profile.given_name ?? null,
            lastName: profile.family_name ?? null,
          }),
        },
      ],
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
