import { ArrowRight, Check } from "lucide-react";
import { MedicalExaminerFeatures } from "@/constants/landing";
import Image from "@/components/Image";
import { createRoute, URLS } from "@/constants/route";
import { ENV } from "@/constants/variables";

const Page: React.FC = () => {
  return (
    <section className="bg-[#F4FBFF] overflow-hidden pt-4">
      <div className="flex h-[calc(75vh-30px)] md:h-[calc(100vh-120px)] flex-col lg:flex-row">
        {/* LEFT: copy */}
        <div className="flex flex-1 flex-col justify-center overflow-y-auto lg:overflow-y-visible px-6 sm:px-8 lg:px-16 xl:px-24 2xl:px-32">
          <div className="w-full max-w-[550px]">
            <h1 className="text-2xl font-bold text-black">
              Join Thrive as an Independent
            </h1>

            <h2
              className="md:mt-1 mt-4 font-bold leading-tight"
              style={{ color: "#00A8FF", fontSize: "clamp(36px, 6vw, 60px)" }}
            >
              Medical Examiner
            </h2>

            <p className="mt-4 text-base text-[#636363] sm:text-lg">
              Trusted by Canadian insurers and legal teams for expert medical
              evaluations.
            </p>

            <form action={createRoute(URLS.REGISTER)}>
              <button
                className="mt-8 inline-flex items-center gap-2 cursor-pointer rounded-full px-12 py-4 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/40"
                style={{
                  background:
                    "linear-gradient(270deg, #89D7FF 0%, #00A8FF 100%)",
                }}
              >
                Let&apos;s Get Started
                <ArrowRight size={18} strokeWidth={3} className="sm:size-5" />
              </button>
            </form>

            <div className="mt-8 sm:mt-10">
              <h3 className=" font-bold text-black sm:text-lg">
                Fully Compliant &amp; Confidential
              </h3>
              <ul className="mt-3 space-y-3">
                {MedicalExaminerFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check
                      size={16}
                      strokeWidth={4}
                      style={{ color: "#00A8FF" }}
                      className="shrink-0"
                    />
                    <span className="text-sm leading-relaxed text-[#333333] sm:text-[15px]">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT: hero image */}
        <div className="relative hidden w-full lg:block lg:max-w-[35%]">
          <div className="absolute inset-0">
            <Image
              src={`${ENV.NEXT_PUBLIC_CDN_URL}/images/examiner-login.png`}
              alt="Hero"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;
