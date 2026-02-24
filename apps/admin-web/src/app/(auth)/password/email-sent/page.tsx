import type { Metadata } from 'next';
import Image from '@/components/Image';
import { ENV } from '@/constants/variables';
import EmailSentCard from '@/domains/auth/components/EmailSentCard';

export const metadata: Metadata = {
  title: 'Email Sent | Thrive Admin',
  description: 'Password reset email sent',
};

type PageProps = {
  searchParams: Promise<{ email?: string }>;
};

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const email = params.email || 'your email';

  return (
    <section className="bg-[#F2F5F6]">
      <div className="h-[calc(100vh-5rem)] min-h-[600px] md:h-[calc(100vh-7.5rem)]">
        <div className="mx-auto grid h-full max-w-full grid-cols-1 lg:grid-cols-2">
          {/* Left - Email Sent Card */}
          <div className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-16 lg:col-span-1 lg:ml-8 lg:justify-end lg:px-20 lg:pr-16">
            <div className="w-full max-w-md lg:max-w-[520px]">
              <EmailSentCard email={email} />
            </div>
          </div>

          {/* Right - Image (Desktop only) */}
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
