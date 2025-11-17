import Image from "@/components/Image";
import { LoginForm } from "@/domains/auth";
import { Metadata } from "next";
import { ENV } from "@/constants/variables";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login | Thrive Examiner",
  description: "Login to your account",
};

const Page = () => {
  return (
    <div className="bg-[#F4FBFF] overflow-hidden pt-4">
      <div className="flex h-[calc(100vh-120px)] flex-col lg:flex-row">
        {/* Left Section - Login Form */}
        <div className="flex flex-1 flex-col justify-center overflow-y-auto lg:overflow-y-visible px-6 py-12 sm:px-8 lg:px-16 xl:px-24 2xl:px-32">
          <div className="mx-auto w-full max-w-[500px]">
            <h1 className="mb-6 text-3xl md:text-5xl font-semibold text-left leading-tight">
              Welcome to <span className="text-[#00A8FF]">Thrive</span>
            </h1>
            <div className="w-full rounded-2xl border border-[#E9EDEE] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-2xl font-semibold sm:text-[30px]">
                Log In
              </h2>
              <Suspense
                fallback={
                  <div className="flex justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00A8FF] border-t-transparent"></div>
                  </div>
                }
              >
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Right Section - Image */}
        <div className="relative hidden w-full lg:block lg:max-w-[35%]">
          <div className="absolute inset-0">
            <Image
              src={`${ENV.NEXT_PUBLIC_CDN_URL}/images/examiner-login.png`}
              alt="Admin Dashboard Preview"
              fill
              sizes="(max-width: 1024px) 100vw, 35vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
