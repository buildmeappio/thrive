import { getBasicPlan } from '@/domains/plan/server/plan.service';
import PlanCard from '@/domains/plan/components/PlanCard';
import { auth } from '@/domains/auth/server/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function PlanPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/');

  const plan = await getBasicPlan();

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

      <div className="mx-auto max-w-sm lg:mx-0">
        <PlanCard plan={plan} />
      </div>
    </div>
  );
}
