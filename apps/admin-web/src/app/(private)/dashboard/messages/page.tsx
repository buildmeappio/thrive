import { Metadata } from 'next';
import { DashboardShell } from '@/layouts/dashboard';
import MessagesPageContent from '@/domains/dashboard/components/MessagesPageContent';
import {
  fetchMessages,
  fetchUnreadMessagesCount,
} from '@/domains/dashboard/actions/messages.actions';

export const metadata: Metadata = {
  title: 'Messages | Thrive Admin',
  description: 'Recent Messages',
};

export const dynamic = 'force-dynamic';

type SearchParams = {
  type?: string;
  isRead?: string;
  page?: string;
  pageSize?: string;
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const type = params.type;
  const isRead = params.isRead;
  const page = parseInt(params.page || '1', 10);
  const pageSize = parseInt(params.pageSize || '20', 10);

  const [messagesData, unreadCount] = await Promise.all([
    fetchMessages({
      type: type && type !== 'all' ? (type as any) : undefined,
      isRead: isRead && isRead !== 'all' ? isRead === 'true' : undefined,
      page,
      pageSize,
    }),
    fetchUnreadMessagesCount(),
  ]);

  // Create a key based on search params to force re-render when filters change
  const filterKey = `${type || 'all'}-${isRead || 'all'}-${page}`;

  return (
    <DashboardShell>
      <MessagesPageContent key={filterKey} initialData={messagesData} unreadCount={unreadCount} />
    </DashboardShell>
  );
};

export default Page;
