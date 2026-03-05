import { getPlansForOnboarding, getFreePlanId } from '@/domains/plan/server/plan.service';
import PlanCard from '@/domains/plan/components/PlanCard';
import { auth } from '@/domains/auth/server/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import RetryButton from './RetryButton';

export default async function PlanPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/');

  // Allow users to create multiple tenants, so we don't redirect if they already have tenants

  let plans: Awaited<ReturnType<typeof getPlansForOnboarding>>;
  let freePlanId: string | null = null;
  let hasError = false;

  // Try to get plans first
  try {
    plans = await getPlansForOnboarding();
  } catch (error) {
    // Connection issue or database error
    console.error('Error loading plans:', error);
    hasError = true;
    plans = [];
  }

  // Try to get free plan ID separately (even if plans failed)
  // This allows users to create a free tenant even if the plans query fails
  try {
    freePlanId = await getFreePlanId();
  } catch (error) {
    // If this also fails, freePlanId stays null
    console.error('Error loading free plan ID:', error);
  }

  // If no plans loaded, show fallback UI
  if (hasError || plans.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-[clamp(28px,3.2vw,36px)] font-semibold text-[#0F1A1C]">
            Choose a Plan
          </h1>
          <p className="mt-1 text-[15px] text-[#7B8B91]">
            Select the plan that best fits your organization.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-[#E9EDEE] bg-white p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-[#0F1A1C]">Unable to Load Plans</h2>
            <p className="text-[15px] text-[#7B8B91]">
              {hasError
                ? 'There was a connection issue loading plans. Please try again or create a tenant directly.'
                : 'No plans are currently available. Please contact support or try creating a tenant.'}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            {freePlanId ? (
              <>
                <Link
                  href={`/portal/onboarding/details?planId=${freePlanId}&planName=${encodeURIComponent('Free')}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] px-6 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:opacity-90"
                >
                  Create Free Tenant
                </Link>
                <RetryButton />
              </>
            ) : (
              <>
                <p className="mb-2 text-sm text-[#7B8B91]">
                  Unable to load plans. Please try again or contact support if the issue persists.
                </p>
                <RetryButton />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[clamp(28px,3.2vw,36px)] font-semibold text-[#0F1A1C]">
          Choose a Plan
        </h1>
        <p className="mt-1 text-[15px] text-[#7B8B91]">
          Select the plan that best fits your organization.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map(plan => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
