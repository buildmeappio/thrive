import { z } from 'zod';

export const provisionJobDataSchema = z.object({
  tenantId: z.string().uuid(),
  stripeSessionId: z.string().min(1),
  keycloakSub: z.string().min(1),
  tenantName: z.string().min(1),
  tenantSlug: z.string().min(1),
  logoUrl: z.string().nullable(),
  stripePriceId: z.string().nullable(),
  adminFirstName: z.string().min(1),
  adminLastName: z.string().min(1),
  adminEmail: z.string().email(),
  stripeSubId: z.string().nullable(),
  stripeCustomerId: z.string().nullable(),
});

export type ProvisionJobDataInput = z.infer<typeof provisionJobDataSchema>;
