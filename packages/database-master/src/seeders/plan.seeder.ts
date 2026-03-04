/* eslint-disable no-console */
import Stripe from 'stripe';
import type { PrismaClient } from '../../generated/client';

type PlanConfig = {
  slug: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
};

const PLANS: PlanConfig[] = [
  {
    slug: 'free',
    name: 'Free',
    description: 'Get started with Thrive at no cost',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      'Multi-tenant workspace management',
      'Role-based access control',
      'SSO via Keycloak',
      'Community support',
    ],
  },
  {
    slug: 'basic',
    name: 'Basic',
    description: 'Everything you need to get started with Thrive',
    priceMonthly: 29,
    priceYearly: 290,
    features: [
      'Multi-tenant workspace management',
      'Billing & subscription management',
      'Role-based access control',
      'SSO via Keycloak',
      'Organization branding',
      'Email support',
    ],
  },
  {
    slug: 'growth',
    name: 'Growth',
    description: 'Scale your organization with advanced features',
    priceMonthly: 79,
    priceYearly: 790,
    features: [
      'Everything in Basic',
      'Advanced analytics & reporting',
      'Priority support',
      'Custom integrations',
      'API access',
      'Dedicated success manager',
    ],
  },
];

const PRODUCT_METADATA_KEY = 'thrive_plan';

export default class PlanSeeder {
  private db: PrismaClient;
  private stripe: Stripe;

  constructor(db: PrismaClient, stripe: Stripe) {
    this.db = db;
    this.stripe = stripe;
  }

  async run(): Promise<void> {
    console.log('🚀 Starting plan seed process...');

    for (const planConfig of PLANS) {
      const isFree = planConfig.priceMonthly === 0 && planConfig.priceYearly === 0;

      if (isFree) {
        await this.upsertPlan(null, null, null, planConfig);
      } else {
        const product = await this.ensureStripeProduct(planConfig);
        const { monthlyPriceId, yearlyPriceId } = await this.ensureStripePrices(
          product.id,
          planConfig
        );
        await this.upsertPlan(product.id, monthlyPriceId, yearlyPriceId, planConfig);
      }
    }

    console.log('✅ Plan seed process completed.');
  }

  private async ensureStripeProduct(plan: PlanConfig): Promise<Stripe.Product> {
    const products = await this.stripe.products.list({
      limit: 100,
      expand: ['data'],
    });

    const existing = products.data.find(p => p.metadata?.[PRODUCT_METADATA_KEY] === plan.slug);

    if (existing) {
      console.log(`ℹ️ Stripe product already exists: ${existing.name} (${existing.id})`);
      return existing;
    }

    const product = await this.stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { [PRODUCT_METADATA_KEY]: plan.slug },
    });
    console.log(`✅ Created Stripe product: ${product.name} (${product.id})`);
    return product;
  }

  private async ensureStripePrices(
    productId: string,
    plan: PlanConfig
  ): Promise<{
    monthlyPriceId: string;
    yearlyPriceId: string;
  }> {
    const prices = await this.stripe.prices.list({
      product: productId,
      active: true,
    });

    const monthly = prices.data.find(
      p => p.recurring?.interval === 'month' && p.recurring?.interval_count === 1
    );
    const yearly = prices.data.find(
      p => p.recurring?.interval === 'year' && p.recurring?.interval_count === 1
    );

    let monthlyPriceId = monthly?.id;
    let yearlyPriceId = yearly?.id;

    if (!monthlyPriceId) {
      const p = await this.stripe.prices.create({
        product: productId,
        unit_amount: Math.round(plan.priceMonthly * 100),
        currency: 'usd',
        recurring: { interval: 'month', interval_count: 1 },
      });
      monthlyPriceId = p.id;
      console.log(`✅ Created Stripe monthly price: ${monthlyPriceId}`);
    } else {
      console.log(`ℹ️ Stripe monthly price already exists: ${monthlyPriceId}`);
    }

    if (!yearlyPriceId) {
      const p = await this.stripe.prices.create({
        product: productId,
        unit_amount: Math.round(plan.priceYearly * 100),
        currency: 'usd',
        recurring: { interval: 'year', interval_count: 1 },
      });
      yearlyPriceId = p.id;
      console.log(`✅ Created Stripe yearly price: ${yearlyPriceId}`);
    } else {
      console.log(`ℹ️ Stripe yearly price already exists: ${yearlyPriceId}`);
    }

    return { monthlyPriceId, yearlyPriceId };
  }

  private async upsertPlan(
    stripeProductId: string | null,
    stripeMonthlyPriceId: string | null,
    stripeYearlyPriceId: string | null,
    plan: PlanConfig
  ): Promise<void> {
    const existing = await this.db.plan.findFirst({
      where: { name: plan.name },
    });

    const data = {
      name: plan.name,
      description: plan.description,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      stripeProductId,
      stripeMonthlyPriceId,
      stripeYearlyPriceId,
      features: plan.features as unknown as object,
      isActive: true,
    };

    if (existing) {
      await this.db.plan.update({
        where: { id: existing.id },
        data,
      });
      console.log(`ℹ️ Updated plan in database: ${plan.name}`);
    } else {
      await this.db.plan.create({
        data,
      });
      console.log(`✅ Created plan in database: ${plan.name}`);
    }
  }
}
