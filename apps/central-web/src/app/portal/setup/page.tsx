import { redirect } from 'next/navigation';
import SetupProgress from '@/domains/tenant/components/SetupProgress';

type Props = {
  searchParams: Promise<{ session_id?: string; tenant_id?: string }>;
};

export default async function SetupPage({ searchParams }: Props) {
  const { session_id, tenant_id } = await searchParams;

  if (!session_id) redirect('/portal/tenants');

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center">
      <div className="mb-12 flex flex-col items-center gap-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Setting Up Your Workspace</h1>
        <p className="max-w-sm text-slate-500">
          We&apos;re provisioning your organization. Please keep this page open.
        </p>
      </div>

      <SetupProgress stripeSessionId={session_id} tenantId={tenant_id} />
    </div>
  );
}
