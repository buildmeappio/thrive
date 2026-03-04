import 'server-only';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { genericOAuth } from 'better-auth/plugins';
import masterDb from '@thrive/database-master/db';

/**
 * Better Auth configuration for admin-web.
 * Uses master DB for auth storage. Keycloak OAuth for SSO.
 */
export const auth = betterAuth({
  database: prismaAdapter(masterDb, {
    provider: 'postgresql',
  }),

  secret: process.env.BETTER_AUTH_SECRET!,

  baseURL: {
    allowedHosts: ['localhost:3000', '*.localhost:3000'],
    protocol: 'http',
  },

  trustedOrigins: ['http://localhost:3000', 'http://*.localhost:3000'],

  logger: {
    level: 'debug',
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
  },

  user: {
    additionalFields: {
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
      keycloakSub: {
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
          mapProfileToUser: async (profile: Record<string, string>) => {
            return {
              name:
                profile.name || `${profile.given_name ?? ''} ${profile.family_name ?? ''}`.trim(),
              email: profile.email,
              image: profile.picture ?? null,
              keycloakSub: profile.sub,
              firstName: profile.given_name ?? null,
              lastName: profile.family_name ?? null,
            };
          },
        },
      ],
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
