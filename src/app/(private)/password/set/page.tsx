import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/domains/auth/server/nextauth/options";
import { URLS } from "@/constants/route";
import Image from "@/components/Image";
import { ENV } from "@/constants/variables";
import { Navbar } from "@/layouts/auth";
import SetPasswordForm from "./SetPasswordForm";

export const metadata: Metadata = {
  title: "Set Password | Thrive Admin",
  description: "Set your password for Thrive Admin",
};

const Page = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(URLS.LOGIN);
  }

  if (!session.user.mustResetPassword) {
    redirect(URLS.DASHBOARD);
  }

  return (
    <>
      <Navbar />
      <section className="bg-[#F2F5F6]">
        <div className="h-[calc(100vh-5rem)] md:h-[calc(100vh-7.5rem)] min-h-[600px]">
        <div className="mx-auto grid h-full max-w-full grid-cols-1 lg:grid-cols-2">
          {/* Left - Form Section */}
          <div className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-16 lg:px-20 lg:col-span-1 lg:justify-end lg:pr-16 lg:ml-8">
            <div className="w-full max-w-md lg:max-w-[520px]">
              <div className="rounded-3xl border border-[#E9EDEE] bg-white p-6 sm:p-7 md:p-8 shadow-xs">
                <h2 className="mb-6 font-semibold text-[clamp(20px,2.2vw,30px)]">
                  Set{" "}
                  <span className="bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] bg-clip-text text-transparent">
                    Password
                  </span>
                </h2>
                <SetPasswordForm />
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
    </>
  );
};

export default Page;

