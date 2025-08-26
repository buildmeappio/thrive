import { z } from 'zod';

/**
 * 🟢 Server-only environment variables
 * Never exposed to the client
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(20, 'JWT_SECRET must be at least 20 characters'),
  // add more: SMTP_URL, REDIS_URL, STRIPE_SECRET_KEY, etc.
});

/**
 * 🔵 Client-exposed environment variables
 * Must start with NEXT_PUBLIC_
 */
const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string(),
  // add more client vars here
});

/**
 * Merge schemas for unified validation
 */
const mergedSchema = serverSchema.merge(clientSchema);

const _env = mergedSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

const envValues = _env.data;

/**
 * Split exports
 * - env.server.* = for server only
 * - env.client.* = safe for client usage
 */
export const env = {
  server: {
    NODE_ENV: envValues.NODE_ENV,
    DATABASE_URL: envValues.DATABASE_URL,
    JWT_SECRET: envValues.JWT_SECRET,
  },
  client: {
    NEXT_PUBLIC_API_URL: envValues.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: envValues.NEXT_PUBLIC_APP_NAME,
  },
} as const;
