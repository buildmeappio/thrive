import { auth } from '@/domains/auth/server/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTenantsByKeycloakSub } from '@/domains/tenant/server/tenant.service';
import TenantCard from '@/domains/tenant/components/TenantCard';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function TenantsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/');

  const keycloakSub = session.user.keycloakSub;
  if (!keycloakSub) redirect('/');

  const tenantUsers = await getTenantsByKeycloakSub(keycloakSub);

  // First-time user — send to onboarding
  if (tenantUsers.length === 0) {
    redirect('/portal/onboarding/plan');
  }

  const adminUrlTemplate = process.env.ADMIN_APP_URL_TEMPLATE!;

  // Add query param to indicate user is coming from central-web (for seamless SSO)
  const buildAdminUrl = (slug: string) => {
    const baseUrl = adminUrlTemplate.replace('{slug}', slug);
    return `${baseUrl}?from=central`;
  };

  const priceLabels: Record<string, string> = {
    [process.env.BASIC_MONTHLY_PRICE_ID!]: 'Basic (Monthly)',
    [process.env.BASIC_YEARLY_PRICE_ID!]: 'Basic (Yearly)',
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[clamp(28px,3.2vw,36px)] font-semibold text-[#0F1A1C]">My Tenants</h1>
          <p className="mt-1 text-[15px] text-[#7B8B91]">
            {tenantUsers.length} organization{tenantUsers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/portal/onboarding/plan"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Tenant
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tenantUsers.map(({ tenant }) => (
          <TenantCard
            key={tenant.id}
            name={tenant.name}
            subdomain={tenant.subdomain}
            status={tenant.status}
            planName={
              tenant.subscription?.stripePriceId
                ? (priceLabels[tenant.subscription.stripePriceId] ?? 'Basic')
                : undefined
            }
            logoUrl={tenant.logoUrl}
            adminUrl={buildAdminUrl(tenant.subdomain)}
          />
        ))}
      </div>
    </div>
  );
}
