import 'server-only';
import masterDb from '@thrive/database-master/db';

export async function getActivePlans() {
  return masterDb.plan.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: 'asc' },
  });
}

/** Plan id for the Free plan (no Stripe). Null if none exists. */
export async function getFreePlanId(): Promise<string | null> {
  const plan = await masterDb.plan.findFirst({
    where: {
      isActive: true,
      stripeProductId: null,
      priceMonthly: 0,
    },
  });
  return plan?.id ?? null;
}

/** Plans for onboarding UI. Free has isFree + planId; paid have monthly/yearly. */
export type PlanForOnboarding =
  | { id: string; name: string; description: string | null; features: string[]; isFree: true }
  | {
      id: string;
      name: string;
      description: string | null;
      features: string[];
      isFree: false;
      monthly: { priceId: string; amount: number };
      yearly: { priceId: string; amount: number };
    };

export async function getPlansForOnboarding(): Promise<PlanForOnboarding[]> {
  const plans = await getActivePlans();
  const result: PlanForOnboarding[] = [];

  for (const p of plans) {
    const features = (Array.isArray(p.features) ? p.features : []).filter(
      (f): f is string => typeof f === 'string'
    );

    if (!p.stripeProductId || !p.stripeMonthlyPriceId || !p.stripeYearlyPriceId) {
      result.push({
        id: p.id,
        name: p.name,
        description: p.description,
        features,
        isFree: true,
      });
    } else {
      const priceMonthly = Number(p.priceMonthly);
      const priceYearly = p.priceYearly != null ? Number(p.priceYearly) : priceMonthly * 12;
      result.push({
        id: p.id,
        name: p.name,
        description: p.description,
        features,
        isFree: false,
        monthly: { priceId: p.stripeMonthlyPriceId, amount: priceMonthly },
        yearly: { priceId: p.stripeYearlyPriceId, amount: priceYearly },
      });
    }
  }

  return result;
}

export async function getBasicPlan() {
  const plan = await masterDb.plan.findFirst({
    where: {
      isActive: true,
      stripeMonthlyPriceId: { not: null },
      stripeYearlyPriceId: { not: null },
    },
    orderBy: { priceMonthly: 'asc' },
  });

  if (!plan) {
    throw new Error(
      'No active plan with monthly/yearly prices found. Run: pnpm --filter @thrive/database-master seed'
    );
  }

  const features = (Array.isArray(plan.features) ? plan.features : []).filter(
    (f): f is string => typeof f === 'string'
  );
  const priceMonthly = Number(plan.priceMonthly);
  const priceYearly = plan.priceYearly != null ? Number(plan.priceYearly) : priceMonthly * 12;

  return {
    name: plan.name,
    description: plan.description ?? undefined,
    features,
    monthly: {
      priceId: plan.stripeMonthlyPriceId!,
      amount: priceMonthly,
    },
    yearly: {
      priceId: plan.stripeYearlyPriceId!,
      amount: priceYearly,
    },
  };
}

/** Build price ID -> display label map (e.g. "Basic (Monthly)") */
export async function getPriceLabels(): Promise<Record<string, string>> {
  const plans = await getActivePlans();
  const labels: Record<string, string> = {};
  for (const p of plans) {
    if (p.stripeMonthlyPriceId) labels[p.stripeMonthlyPriceId] = `${p.name} (Monthly)`;
    if (p.stripeYearlyPriceId) labels[p.stripeYearlyPriceId] = `${p.name} (Yearly)`;
  }
  return labels;
}

/** Allowed price IDs for checkout validation */
export async function getAllowedPriceIds(): Promise<string[]> {
  const plans = await getActivePlans();
  const ids: string[] = [];
  for (const p of plans) {
    if (p.stripeMonthlyPriceId) ids.push(p.stripeMonthlyPriceId);
    if (p.stripeYearlyPriceId) ids.push(p.stripeYearlyPriceId);
  }
  return ids;
}
