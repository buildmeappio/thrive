import { getPriceLabels } from '@/domains/plan/server/plan.service';
import TenantCard from '@/domains/tenant/components/TenantCard';
import { getLogoUrl } from '@/lib/s3';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import withProtected, { ProtectedProps } from '@/components/Protected';

type Params = Promise<object>;

// Add query param to indicate user is coming from central-web (for seamless SSO)
const buildAdminUrl = (slug: string) => {
  const adminUrlTemplate = process.env.ADMIN_APP_URL_TEMPLATE!;
  const adminUrl = adminUrlTemplate.replace('{slug}', slug);
  return `${adminUrl}/dashboard-new?from=central`;
};

const TenantsPage = withProtected(async ({ availableTenants }: ProtectedProps<Params>) => {
  // If user has no tenants, show empty state
  if (availableTenants.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-[clamp(28px,3.2vw,36px)] font-semibold text-[#0F1A1C]">My Tenants</h1>
          <p className="mt-1 text-[15px] text-[#7B8B91]">You don&apos;t have any tenants yet</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-[#E9EDEE] bg-white p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F2F5F6]">
            <Plus className="h-8 w-8 text-[#7B8B91]" />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-[#0F1A1C]">No Tenants Yet</h2>
            <p className="text-[15px] text-[#7B8B91]">
              Create your first tenant to get started with managing your organization.
            </p>
          </div>

          <Link
            href="/portal/onboarding/plan"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] px-6 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:opacity-90"
          >
            <Plus className="h-5 w-5" />
            Create Tenant
          </Link>
        </div>
      </div>
    );
  }

  const [priceLabels, ...tenantCards] = await Promise.all([
    await getPriceLabels(),
    ...availableTenants.map(async tenant => ({
      tenant,
      logoUrl: await getLogoUrl(tenant.logoUrl),
    })),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[clamp(28px,3.2vw,36px)] font-semibold text-[#0F1A1C]">My Tenants</h1>
          <p className="mt-1 text-[15px] text-[#7B8B91]">
            {availableTenants.length} organization{availableTenants.length !== 1 ? 's' : ''}
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
        {tenantCards.map(({ tenant, logoUrl }) => (
          <TenantCard
            key={tenant.id}
            tenantId={tenant.id}
            name={tenant.name}
            subdomain={tenant.subdomain}
            status={tenant.status}
            planName={
              tenant.subscription?.stripePriceId
                ? (priceLabels[tenant.subscription.stripePriceId] ?? 'Basic')
                : tenant.subscription
                  ? 'Free'
                  : undefined
            }
            logoUrl={logoUrl}
            adminUrl={buildAdminUrl(tenant.subdomain)}
            pendingStripePriceId={tenant.pendingStripePriceId}
          />
        ))}
      </div>
    </div>
  );
});

export default TenantsPage;
