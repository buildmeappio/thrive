import { ResetPasswordForm } from "@/domains/auth";
import type { Metadata } from "next";
import Image from "@/components/Image";
import { ENV } from "@/constants/variables";
import { redirect } from "next/navigation";
import { URLS } from "@/constants/route";

export const metadata: Metadata = {
  title: "Reset Password | Thrive Admin",
  description: "Reset your password for Thrive Admin",
};

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const token = params.token;

  // Redirect if no token provided
  if (!token) {
    redirect(URLS.PASSWORD_FORGOT);
  }

  return (
    <section className="bg-[#F2F5F6]">
      <div className="h-[calc(100vh-5rem)] md:h-[calc(100vh-7.5rem)] min-h-[600px]">
        <div className="mx-auto grid h-full max-w-full grid-cols-1 lg:grid-cols-2">
          {/* Left - Form Section */}
          <div className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-16 lg:px-20 lg:col-span-1 lg:justify-end lg:pr-16 lg:ml-8">
            <div className="w-full max-w-md lg:max-w-[520px]">
              <div className="rounded-3xl border border-[#E9EDEE] bg-white p-6 sm:p-7 md:p-8 shadow-xs">
                <h2 className="mb-6 font-semibold text-[clamp(20px,2.2vw,30px)]">
                  Reset{" "}
                  <span className="bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] bg-clip-text text-transparent">
                    Password
                  </span>
                </h2>
                <ResetPasswordForm token={token} />
              </div>
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
