import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminDashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const queryString = new URLSearchParams();

  // Preserve all query params
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, v));
      } else {
        queryString.set(key, value);
      }
    }
  });

  const query = queryString.toString();
  redirect(`/admin/dashboard-new${query ? `?${query}` : ''}`);
}
