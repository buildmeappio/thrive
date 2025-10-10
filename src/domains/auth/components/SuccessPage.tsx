"use client";

import { URLS } from "@/constants/route";
import { ArrowRight, Smile, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const SuccessPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const isError = !!error;
  const errorMessages: Record<string, { title: string; description: string }> =
    {
      invalid_token: {
        title: "Invalid or Expired Token",
        description:
          "The password setup link is invalid or has expired. Please contact support or request a new approval email.",
      },
      user_not_found: {
        title: "User Not Found",
        description:
          "We could not find your account in our system. Please contact support for assistance.",
      },
    };

  const errorData = error ? errorMessages[error] : null;

  return (
    <div className="bg-[#F4FBFF]">
      <div className="mx-auto min-h-screen max-w-[900px] p-6">
        <div
          className="min-h-[350px] rounded-[20px] bg-white px-1 py-5 md:min-h-[400px] md:px-[50px] md:py-0"
          style={{
            boxShadow: "0px 0px 36.35px 0px #00000008",
          }}>
          <div className="-mb-6 pt-1 pb-1 md:mb-0">
            <div className="flex items-center justify-center p-4">
              <div className="flex w-full flex-col items-center justify-center p-6 text-center md:p-8">
                <div
                  className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
                    isError ? "bg-red-500" : "bg-[#00A8FF]"
                  }`}>
                  {isError ? (
                    <AlertCircle
                      className="h-8 w-8 text-white"
                      strokeWidth={2}
                    />
                  ) : (
                    <Smile className="h-8 w-8 text-white" strokeWidth={2} />
                  )}
                </div>

                <h3 className="mb-4 text-2xl font-semibold md:mb-0 md:text-[52px]">
                  {isError ? errorData?.title || "Error" : "Success!"}
                </h3>

                <p className="mb-6 w-full max-w-[1200px] text-center text-sm leading-relaxed text-[#848484] md:text-lg">
                  {isError
                    ? errorData?.description ||
                      "An error occurred. Please try again or contact support."
                    : "Your account has been successfully created. You can log in to view and manage your profile, documents, and upcoming IMEs."}
                </p>

                <button
                  onClick={() => {
                    router.push(URLS.LOGIN);
                  }}
                  className={`mt-0 flex h-[50px] w-full max-w-[350px] cursor-pointer items-center justify-center gap-2 rounded-[33px] p-4 font-medium text-white transition-colors duration-200 md:mt-6 ${
                    isError
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-[#00A8FF] hover:bg-[#0088cc]"
                  }`}>
                  {isError ? "Back to Login" : "Continue"}
                  <ArrowRight
                    color="white"
                    className="h-4 w-4 transition-all duration-300 ease-in-out"
                    strokeWidth={2}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPageContent;
