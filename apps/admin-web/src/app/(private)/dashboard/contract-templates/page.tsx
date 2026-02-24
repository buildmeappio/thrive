import { Metadata } from 'next';
import { DashboardShell } from '@/layouts/dashboard';
import { listContractTemplatesAction } from '@/domains/contract-templates/actions';
import ContractTemplatesPageContent from '@/domains/contract-templates/components/ContractTemplatesPageContent';

export const metadata: Metadata = {
  title: 'Contract Templates | Thrive Admin',
  description: 'Manage contract templates in the Thrive Admin dashboard.',
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ status?: string; search?: string }>;
};

export default async function ContractTemplatesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = sp.status === 'ACTIVE' || sp.status === 'INACTIVE' ? sp.status : 'ALL';
  const search = typeof sp.search === 'string' ? sp.search : '';

  const result = await listContractTemplatesAction({ status, search });

  if (!result.success) {
    const errorResult = result as { success: false; error: string };
    return (
      <DashboardShell>
        <div className="space-y-6">
          <h1 className="font-degular text-[20px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
            Contract Templates
          </h1>
          <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-poppins text-red-600">
              {errorResult.error || 'Error fetching contract templates'}
            </p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <ContractTemplatesPageContent
        templates={result.data}
        initialStatus={status as any}
        initialSearch={search}
      />
    </DashboardShell>
  );
}
