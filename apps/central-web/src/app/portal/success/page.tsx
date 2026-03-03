import { redirect } from 'next/navigation';
import Link from 'next/link';
import masterDb from '@thrive/database-master/db';

type Props = {
  searchParams: Promise<{ slug?: string }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const { slug } = await searchParams;

  if (!slug) redirect('/portal/tenants');

  const tenant = await masterDb.tenant.findUnique({
    where: { subdomain: slug },
    select: { name: true, subdomain: true },
  });

  const adminUrl = `${process.env.ADMIN_APP_URL_TEMPLATE!.replace('{slug}', slug)}?from=central`;

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
      <div className="flex max-w-md flex-col items-center gap-8 text-center">
        {/* Success icon */}
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {/* Confetti dots */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 animate-ping rounded-full"
              style={{
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
                top: `${50 + 45 * Math.sin((i * Math.PI * 2) / 8)}%`,
                left: `${50 + 45 * Math.cos((i * Math.PI * 2) / 8)}%`,
                animationDelay: `${i * 150}ms`,
                animationDuration: '1.5s',
              }}
            />
          ))}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">{tenant?.name ?? slug} is ready!</h1>
          <p className="mt-2 text-slate-500">
            Your workspace has been set up successfully. You can now start managing your
            organization.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href="/portal/tenants"
            className="flex-1 rounded-xl border border-slate-300 py-3 text-center font-semibold text-slate-700 transition-colors hover:border-slate-400"
          >
            View All My Tenants
          </Link>
          <a
            href={adminUrl}
            className="flex-1 rounded-xl bg-blue-600 py-3 text-center font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Manage {tenant?.name ?? slug}
          </a>
        </div>
      </div>
    </div>
  );
}
