import { auth } from '@/domains/auth/server/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import TenantDetailsForm from '@/domains/tenant/components/TenantDetailsForm';

const ALLOWED_PRICE_IDS = [
  process.env.BASIC_MONTHLY_PRICE_ID,
  process.env.BASIC_YEARLY_PRICE_ID,
].filter(Boolean) as string[];

type Props = {
  searchParams: Promise<{ priceId?: string; billing?: string; planName?: string }>;
};

export default async function DetailsPage({ searchParams }: Props) {
  const { priceId, billing, planName } = await searchParams;

  if (!priceId || !ALLOWED_PRICE_IDS.includes(priceId)) {
    redirect('/portal/onboarding/plan');
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/');

  const displayName = planName ? decodeURIComponent(planName) : 'Basic';
  const displayBilling = billing === 'yearly' ? 'yearly' : 'monthly';

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#7B8B91]">
        <span>Plan</span>
        <span>›</span>
        <span className="font-medium text-[#0F1A1C]">Details</span>
        <span>›</span>
        <span>Payment</span>
      </div>

      <div>
        <h1 className="text-[clamp(28px,3.2vw,36px)] font-semibold text-[#0F1A1C]">
          Set Up Your Organization
        </h1>
        <p className="mt-1 text-[15px] text-[#7B8B91]">
          Selected plan:{' '}
          <span className="font-medium text-[#0F1A1C]">
            {displayName} ({displayBilling})
          </span>
        </p>
      </div>

      <div className="rounded-3xl border border-[#E9EDEE] bg-white p-7 shadow-sm sm:p-8">
        <TenantDetailsForm
          priceId={priceId}
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
