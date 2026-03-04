'use client';
import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { PlanForOnboarding } from '@/domains/plan/server/plan.service';

type PlanCardProps = {
  plan: PlanForOnboarding;
};

export default function PlanCard({ plan }: PlanCardProps) {
  const router = useRouter();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  if (plan.isFree) {
    function handleFreeSelect() {
      router.push(
        `/portal/onboarding/details?planId=${plan.id}&planName=${encodeURIComponent(plan.name)}`
      );
    }

    return (
      <div className="shadow-card flex flex-col gap-6 rounded-3xl border-2 border-[#00A8FF] bg-white p-7 sm:p-8">
        <div>
          <h3 className="text-2xl font-bold text-[#0F1A1C]">{plan.name}</h3>
          <p className="mt-1 text-[15px] text-[#7B8B91]">{plan.description ?? ''}</p>
        </div>

        <div>
          <div className="flex items-end gap-1">
            <span className="text-4xl font-extrabold text-[#0F1A1C]">$0</span>
            <span className="mb-1.5 text-sm text-[#7B8B91]">/month</span>
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-[#0F1A1C]">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#00A8FF]" />
              {feature}
            </li>
          ))}
        </ul>

        <button
          onClick={handleFreeSelect}
          className="mt-auto w-full rounded-xl bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] py-3.5 font-semibold text-white shadow-sm transition-all duration-200 hover:opacity-90"
        >
          Get Started Free
        </button>
      </div>
    );
  }

  const paidPlan = plan as Extract<PlanForOnboarding, { isFree: false }>;
  const yearlyPerMonth = paidPlan.yearly.amount / 12;
  const savePct = Math.round((1 - yearlyPerMonth / paidPlan.monthly.amount) * 100);
  const displayPrice = billing === 'monthly' ? paidPlan.monthly.amount : yearlyPerMonth;
  const selectedPriceId =
    billing === 'monthly' ? paidPlan.monthly.priceId : paidPlan.yearly.priceId;

  function handleSelect() {
    router.push(
      `/portal/onboarding/details?priceId=${selectedPriceId}&billing=${billing}&planName=${encodeURIComponent(paidPlan.name)}`
    );
  }

  return (
    <div className="shadow-card flex flex-col gap-6 rounded-3xl border-2 border-[#00A8FF] bg-white p-7 sm:p-8">
      {/* Billing toggle */}
      <div className="flex gap-1 rounded-xl bg-[#F2F5F6] p-1">
        <button
          onClick={() => setBilling('monthly')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
            billing === 'monthly'
              ? 'bg-white text-[#0F1A1C] shadow-sm'
              : 'text-[#7B8B91] hover:text-[#0F1A1C]'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling('yearly')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all ${
            billing === 'yearly'
              ? 'bg-white text-[#0F1A1C] shadow-sm'
              : 'text-[#7B8B91] hover:text-[#0F1A1C]'
          }`}
        >
          Yearly
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
            -{savePct}%
          </span>
        </button>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-[#0F1A1C]">{paidPlan.name}</h3>
        <p className="mt-1 text-[15px] text-[#7B8B91]">{paidPlan.description ?? ''}</p>
      </div>

      <div>
        <div className="flex items-end gap-1">
          <span className="text-4xl font-extrabold text-[#0F1A1C]">
            ${displayPrice % 1 === 0 ? displayPrice.toFixed(0) : displayPrice.toFixed(2)}
          </span>
          <span className="mb-1.5 text-sm text-[#7B8B91]">/month</span>
        </div>
        {billing === 'yearly' && (
          <p className="mt-1 text-xs text-[#7B8B91]">
            Billed ${paidPlan.yearly.amount.toFixed(0)} / year
          </p>
        )}
      </div>

      <ul className="flex flex-col gap-3">
        {paidPlan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-[#0F1A1C]">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#00A8FF]" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={handleSelect}
        className="mt-auto w-full rounded-xl bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] py-3.5 font-semibold text-white shadow-sm transition-all duration-200 hover:opacity-90"
      >
        Get Started
      </button>
    </div>
  );
}
