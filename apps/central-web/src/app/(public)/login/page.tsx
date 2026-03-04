import type { Metadata } from 'next';
import Image from 'next/image';
import SignInButton from '@/domains/auth/components/SignInButton';
import { auth } from '@/domains/auth/server/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Login | Thrive Portal',
  description: 'Sign in to manage your Thrive tenants',
};

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || 'https://assets.thriveassessmentcare.com';

const LoginPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect('/portal/tenants');
  }

  return (
    <section className="bg-[#F2F5F6]">
      <div className="min-h-[calc(100vh-5rem)] md:min-h-[calc(100vh-7.5rem)]">
        <div className="mx-auto grid h-full max-w-full grid-cols-1 lg:grid-cols-2">
          {/* ── Left column ── */}
          <div className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-16 lg:col-span-1 lg:justify-center lg:px-20 lg:pr-8">
            <div className="w-full max-w-md lg:max-w-[520px]">
              <h1 className="mb-4 w-full text-center text-[clamp(28px,3.2vw,44px)] font-semibold leading-tight tracking-tight lg:text-left">
                Welcome To{' '}
                <span className="bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] bg-clip-text text-transparent">
                  Thrive
                </span>
                <br />
                Portal
              </h1>

              <p className="mb-6 text-center text-[15px] text-[#7b8b91] lg:text-left">
                Create and manage your organization workspaces, billing, and settings — all in one
                place.
              </p>

              {/* ── Card ── */}
              <div className="shadow-xs rounded-3xl border border-[#E9EDEE] bg-white p-6 sm:p-7 md:p-8">
                <h2 className="mb-2 text-[clamp(20px,2.2vw,30px)] font-semibold">Get Started</h2>
                <p className="mb-6 text-sm text-[#9EA9AA]">
                  Sign in with your Thrive account to continue.
                </p>

                <SignInButton />

                {/* Divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#E9EDEE]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-[#9EA9AA]">
                      Secure sign-in via Keycloak
                    </span>
                  </div>
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center gap-2">
                  {['Multi-tenant', 'Billing', 'Role management', 'SSO'].map(feat => (
                    <span
                      key={feat}
                      className="rounded-full bg-[#F2F5F6] px-3 py-1 text-xs font-medium text-[#7b8b91]"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-[#9EA9AA]">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>

          {/* ── Right column — decorative image ── */}
          <div className="relative hidden overflow-hidden lg:flex lg:items-center lg:justify-end">
            <Image
              src={`${cdnUrl}/images/admin-login.png`}
              alt="Thrive Portal Preview"
              width={600}
              height={500}
              className="max-h-[80vh] w-auto object-contain"
              priority
            />
            {/* Gradient left-fade to match bg */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F2F5F6] to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
