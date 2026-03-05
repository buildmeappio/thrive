'use client';

import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { resumeCheckoutAction } from '@/domains/tenant/actions/resume-checkout.action';

type Props = {
  tenantId: string;
  name: string;
  subdomain: string;
  status: string;
  planName?: string;
  logoUrl?: string | null;
  adminUrl: string;
  pendingStripePriceId?: string | null;
};

export default function TenantCard({
  tenantId,
  name,
  subdomain,
  status,
  planName,
  logoUrl,
  adminUrl,
  pendingStripePriceId,
}: Props) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    SUSPENDED: 'bg-red-100 text-red-700',
    DRAFT: 'bg-gray-100 text-gray-700',
  };

  // Check if tenant is DRAFT and needs payment
  const needsPayment = status === 'DRAFT' && pendingStripePriceId;

  const handleManageClick = async (e: React.MouseEvent) => {
    if (needsPayment) {
      e.preventDefault();
      e.stopPropagation();
      setIsRedirecting(true);

      try {
        const result = await resumeCheckoutAction({ tenantId });
        if (result.error) {
          toast.error(result.error);
          setIsRedirecting(false);
          return;
        }

        if (result.url) {
          window.location.href = result.url;
        }
      } catch (error) {
        console.error('Error resuming checkout:', error);
        toast.error('Failed to redirect to payment. Please try again.');
        setIsRedirecting(false);
      }
    }
    // If not needs payment, let the default link behavior work
  };

  return (
    <div className="hover:shadow-card flex flex-col gap-5 rounded-3xl border border-[#E9EDEE] bg-white p-6 transition-all duration-200">
      <div className="flex items-center gap-3">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={name}
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#01F4C8] to-[#00A8FF]">
            <span className="text-base font-bold text-white">{name.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-[#0F1A1C]">{name}</h3>
          <p className="mt-0.5 text-xs text-[#7B8B91]">{subdomain}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusColor[status] ?? 'bg-[#EEF1F3] text-[#7B8B91]'}`}
        >
          {status.toLowerCase()}
        </span>
        {planName && <span className="text-xs text-[#7B8B91]">{planName}</span>}
      </div>

      {needsPayment ? (
        <button
          onClick={handleManageClick}
          disabled={isRedirecting}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E4E9EC] bg-white py-2.5 text-sm font-medium text-[#0F1A1C] transition-all duration-200 hover:border-[#00A8FF] hover:bg-[#EDF7FF] hover:text-[#00A8FF] disabled:opacity-60"
        >
          {isRedirecting ? 'Redirecting...' : 'Complete Payment'}
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      ) : (
        <a
          href={adminUrl}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#E4E9EC] bg-white py-2.5 text-sm font-medium text-[#0F1A1C] transition-all duration-200 hover:border-[#00A8FF] hover:bg-[#EDF7FF] hover:text-[#00A8FF]"
        >
          Manage
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}
