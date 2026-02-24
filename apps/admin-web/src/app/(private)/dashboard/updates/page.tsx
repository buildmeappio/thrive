import { Metadata } from 'next';
import { DashboardShell } from '@/layouts/dashboard';
import UpdatesPageContent from '@/domains/dashboard/components/UpdatesPageContent';
import { fetchUpdates } from '@/domains/dashboard/actions/updates.actions';

export const metadata: Metadata = {
  title: 'Updates | Thrive Admin',
  description: 'Recent Updates',
};

export const dynamic = 'force-dynamic';

type SearchParams = {
  type?: string;
  dateRange?: string;
  page?: string;
  pageSize?: string;
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const type = params.type;
  const dateRange = params.dateRange;
  const page = parseInt(params.page || '1', 10);
  const pageSize = parseInt(params.pageSize || '20', 10);

  const updatesData = await fetchUpdates({
    type: type && type !== 'all' ? (type as any) : undefined,
    dateRange: dateRange && dateRange !== 'all' ? (dateRange as any) : undefined,
    page,
    pageSize,
  });

  // Create a key based on search params to force re-render when filters change
  const filterKey = `${type || 'all'}-${dateRange || 'all'}-${page}`;

  return (
    <DashboardShell>
      <UpdatesPageContent key={filterKey} initialData={updatesData} />
    </DashboardShell>
  );
};

export default Page;
