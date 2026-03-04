import 'server-only';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { genericOAuth, oAuthProxy } from 'better-auth/plugins';
import masterDb from '@thrive/database-master/db';

const betterAuthUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
const oauthProxyProductionUrl = process.env.BETTER_AUTH_PROXY_PRODUCTION_URL ?? betterAuthUrl;
const oauthProxyMaxAge = Number(process.env.BETTER_AUTH_PROXY_MAX_AGE ?? 60);
const trustedOrigins = (
  process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? `${betterAuthUrl},http://*.localhost:3000`
)
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

/**
 * Better Auth configuration for admin-web.
 * Uses master DB for auth storage. Keycloak OAuth for SSO.
 */
export const auth = betterAuth({
  database: prismaAdapter(masterDb, {
    provider: 'postgresql',
  }),

  secret: process.env.BETTER_AUTH_SECRET!,

  // Keep a single, fixed auth origin so Keycloak can use one registered redirect URI.
  baseURL: betterAuthUrl,
  trustedOrigins,

  logger: {
    level: 'debug',
  },

  // Keep OAuth state/session cookies host-only on the fixed auth origin.
  // `.localhost` cookie domains are unreliable and can cause cookies to be dropped.
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
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
          pkce: true,
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
          requireIssuerValidation: true,
        },
      ],
    }),
    oAuthProxy({
      productionURL: oauthProxyProductionUrl,
      maxAge: Number.isFinite(oauthProxyMaxAge) ? oauthProxyMaxAge : 60,
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
