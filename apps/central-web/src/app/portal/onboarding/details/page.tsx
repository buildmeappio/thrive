import { auth } from '@/domains/auth/server/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import TenantDetailsForm from '@/domains/tenant/components/TenantDetailsForm';
import { getAllowedPriceIds, getFreePlanId } from '@/domains/plan/server/plan.service';

type Props = {
  searchParams: Promise<{ priceId?: string; planId?: string; billing?: string; planName?: string }>;
};

export default async function DetailsPage({ searchParams }: Props) {
  const { priceId, planId, billing, planName } = await searchParams;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/');

  const freePlanId = await getFreePlanId();
  const allowedPriceIds = await getAllowedPriceIds();

  const isFreeFlow = planId && freePlanId && planId === freePlanId;
  const isPaidFlow = priceId && allowedPriceIds.includes(priceId);

  if (!isFreeFlow && !isPaidFlow) {
    redirect('/portal/onboarding/plan');
  }

  const displayName = planName ? decodeURIComponent(planName) : isFreeFlow ? 'Free' : 'Basic';
  const displayBilling = billing === 'yearly' ? 'yearly' : 'monthly';

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-[#7B8B91]">
        <span>Plan</span>
        <span>›</span>
        <span className="font-medium text-[#0F1A1C]">Details</span>
        <span>›</span>
        <span>{isFreeFlow ? 'Setup' : 'Payment'}</span>
      </div>

      <div>
        <h1 className="text-[clamp(28px,3.2vw,36px)] font-semibold text-[#0F1A1C]">
          Set Up Your Organization
        </h1>
        <p className="mt-1 text-[15px] text-[#7B8B91]">
          Selected plan:{' '}
          <span className="font-medium text-[#0F1A1C]">
            {displayName}
            {!isFreeFlow && ` (${displayBilling})`}
          </span>
        </p>
      </div>

      <div className="rounded-3xl border border-[#E9EDEE] bg-white p-7 shadow-sm sm:p-8">
        <TenantDetailsForm
          priceId={isPaidFlow ? priceId : undefined}
          planId={isFreeFlow ? planId : undefined}
          adminUrlTemplate={process.env.ADMIN_APP_URL_TEMPLATE!}
          defaultValues={{
            firstName: session.user.firstName ?? '',
            lastName: session.user.lastName ?? '',
            email: session.user.email,
          }}
        />
      </div>
    </div>
  );
}
