import 'server-only';
import masterDb from '@thrive/database-master/db';
import { stripe } from '@/domains/stripe/server/stripe.client';

export async function getActivePlans() {
  return masterDb.plan.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: 'asc' },
  });
}

export async function getBasicPlan() {
  const monthlyPriceId = process.env.BASIC_MONTHLY_PRICE_ID!;
  const yearlyPriceId = process.env.BASIC_YEARLY_PRICE_ID!;

  const [monthlyPrice, yearlyPrice] = await Promise.all([
    stripe.prices.retrieve(monthlyPriceId),
    stripe.prices.retrieve(yearlyPriceId),
  ]);

  return {
    name: 'Basic',
    description: 'Everything you need to get started with Thrive',
    features: [
      'Multi-tenant workspace management',
      'Billing & subscription management',
      'Role-based access control',
      'SSO via Keycloak',
      'Organization branding',
      'Email support',
    ],
    monthly: {
      priceId: monthlyPriceId,
      amount: (monthlyPrice.unit_amount ?? 0) / 100,
    },
    yearly: {
      priceId: yearlyPriceId,
      amount: (yearlyPrice.unit_amount ?? 0) / 100,
    },
  };
}
