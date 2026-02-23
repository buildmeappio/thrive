"use client";

import { URLS } from "@/constants/route";
import { ArrowRight, FileQuestion } from "lucide-react";
import { useRouter } from "next/navigation";

const NotFoundPage = () => {
  const router = useRouter();

  return (
    <div className="bg-[#F4FBFF] min-h-screen">
      <div className="mx-auto max-w-[900px] p-6">
        <div
          className="mt-20 min-h-[350px] rounded-[20px] bg-white px-1 py-5 md:min-h-[400px] md:px-[50px] md:py-0"
          style={{
            boxShadow: "0px 0px 36.35px 0px #00000008",
          }}
        >
          <div className="-mb-6 pt-1 pb-1 md:mb-0">
            <div className="flex items-center justify-center p-4">
              <div className="flex w-full flex-col items-center justify-center p-6 text-center md:p-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#00A8FF]">
                  <FileQuestion
                    className="h-8 w-8 text-white"
                    strokeWidth={2}
                  />
                </div>

                <h3 className="mb-4 text-2xl font-semibold md:mb-0 md:text-[52px]">
                  404 - Page Not Found
                </h3>

                <p className="mb-6 w-full max-w-[1200px] text-center text-sm leading-relaxed text-[#848484] md:text-lg">
                  The page you are looking for does not exist or has been moved.
                  <br />
                  Please check the URL or return to the home page.
                </p>

                <button
                  onClick={() => {
                    router.push(URLS.LOGIN);
                  }}
                  className="mt-0 flex h-[50px] w-full max-w-[350px] cursor-pointer items-center justify-center gap-2 rounded-[33px] bg-[#00A8FF] p-4 font-medium text-white transition-colors duration-200 hover:bg-[#0088cc] md:mt-6"
                >
                  Back to Home
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

export default NotFoundPage;
