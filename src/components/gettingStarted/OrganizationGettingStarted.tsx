import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { OrganizationFeatures } from "~/config/GettingStartedFeatures.config";
import type { OrganizationGettingStartedProps } from "~/types";

export const OrganizationGettingStarted: React.FC<
  OrganizationGettingStartedProps
> = ({ onGetStarted }) => {
  return (
    <div className="flex min-h-screen bg-[#FAFAFF]">
      <div className="mt-16 w-[60%] flex-shrink-0 pl-20">
        <div className="space-y-6">
          <div className="">
            <h1 className="text-[40px] font-bold text-gray-900">
              Independent Medical
            </h1>
            <h2 className="text-[40px] font-bold">
              Examinations for{" "}
              <span
                className="text-[40px] font-bold"
                style={{
                  color: "#000080",
                }}
              >
                Organization
              </span>
            </h2>
            <p className="text-base text-[#636363] max-w-[80%]">
              Thrive helps insurance companies, government agencies, &
              regulatory bodies manage independent medical examinations with
              speed, accuracy, and total transparency — all from one secure
              platform.
            </p>
          </div>

          <button
            onClick={onGetStarted}
            className="flex cursor-pointer items-center gap-2 rounded-full px-8 py-4 text-[16px] font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{
              background: "linear-gradient(90deg, #000080 0%, #5151B9 100%)",
            }}
          >
            Let's Get Started
            <ArrowRight size={20} strokeWidth={3} />
          </button>

          <div className="mt-10 space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">
              Fully Compliant & Confidential
            </h3>
            <ul className="space-y-3 pb-4">
              {OrganizationFeatures.map((feature, index) => (
                <li key={index} className="flex items-center space-x-1">
                  <Check
                    size={13}
                    strokeWidth={5}
                    style={{ color: "#000080" }}
                  />
                  <span className="text-sm leading-relaxed text-[#333333]">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="relative mt-16 flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/org-gettingStarted.png"
            alt="Admin Dashboard Preview"
            width={200}
            height={200}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};
