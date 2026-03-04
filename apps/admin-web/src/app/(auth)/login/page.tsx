import { LoginForm } from '@/domains/auth';
import type { Metadata } from 'next';
import Image from '@/components/Image';
import { ENV } from '@/constants/variables';
import { redirect } from 'next/navigation';
import { auth } from '@/domains/auth/server/better-auth/auth';
import { headers } from 'next/headers';
import SSORedirectBetterAuth from './SSORedirectBetterAuth';

export const metadata: Metadata = {
  title: 'Login | Thrive Admin',
  description: 'Login yourself on Thrive Admin',
};

interface PageProps {
  searchParams: Promise<{ error?: string; sso?: string }>;
}

const Page = async ({ searchParams }: PageProps) => {
  // Check Better Auth session
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const { error, sso } = await searchParams;

  if (session?.user) {
    redirect('/admin/dashboard-new');
  }

  // If error and not SSO attempt, show the credentials form
  // Otherwise, attempt automatic Keycloak SSO (will use existing Keycloak session if available)
  const showForm = !!error && !sso;

  // Determine error message
  let errorMessage: string | null = null;
  if (error === 'Callback' || error === 'login_required') {
    errorMessage =
      'Please sign in to continue. You can use your credentials or sign in with Keycloak.';
  } else if (error) {
    errorMessage = 'Authentication failed. Please try again.';
  }

  return (
    <section className="bg-[#F2F5F6]">
      <div className="min-h-[600px] min-h-[calc(100vh-5rem)] md:min-h-[calc(100vh-7.5rem)]">
        <div className="mx-auto grid h-full max-w-full grid-cols-1 lg:grid-cols-2">
          {/* Left */}
          <div className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-16 lg:col-span-1 lg:justify-center lg:px-20 lg:pr-8">
            <div className="w-full max-w-md lg:max-w-[520px]">
              <h1 className="mb-4 w-full text-center text-[clamp(28px,3.2vw,44px)] font-semibold leading-tight tracking-tight lg:text-left">
                Welcome To{' '}
                <span className="bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] bg-clip-text text-transparent">
                  Thrive
                </span>
                <br /> Admin Dashboard
              </h1>

              <div className="shadow-xs rounded-3xl border border-[#E9EDEE] bg-white p-6 sm:p-7 md:p-8">
                {showForm ? (
                  <>
                    <h2 className="mb-6 text-[clamp(20px,2.2vw,30px)] font-semibold">Log In</h2>
                    {errorMessage && (
                      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                        {errorMessage}
                      </div>
                    )}
                    <LoginForm />
                  </>
                ) : (
                  <SSORedirectBetterAuth />
                )}
              </div>
            </div>
          </div>

          {/* Right (only on lg+) */}
          <div className="relative hidden lg:flex lg:items-center lg:justify-end">
            <Image
              src={`${ENV.NEXT_PUBLIC_CDN_URL}/images/admin-login.png`}
              alt="Admin Dashboard Preview"
              width={600}
              height={500}
              sizes="(max-width: 1024px) 0px, 66vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;
