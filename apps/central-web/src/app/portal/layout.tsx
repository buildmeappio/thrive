import { auth } from '@/domains/auth/server/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-[#F2F5F6]">
      {/* Portal top nav */}
      <header className="flex items-center justify-between border-b border-[#E9EDEE] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-[#01F4C8] to-[#00A8FF]">
            <span className="text-sm font-bold text-white">T</span>
          </div>
          <span className="font-semibold text-[#0F1A1C]">Thrive Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#7B8B91]">
            {session.user.firstName
              ? `${session.user.firstName} ${session.user.lastName ?? ''}`.trim()
              : session.user.email}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
