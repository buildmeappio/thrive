import { ArrowRight, Check } from "lucide-react";
import { MedicalExaminerFeatures } from "@/constants/landing";
import Image from "@/components/Image";
import { createRoute, URLS } from "@/constants/route";

const Page: React.FC = () => {
  return (
    <section
      className={`
        relative w-full bg-[#fafafa]
        min-h-[calc(100vh-120px)] h-full overflow-hidden short:min-h-[600px] short:overflow-auto
      `}
    >
      {/* 2-col at md, stacked on mobile */}
      <div className="grid h-full w-full items-center md:grid-cols-2">
        {/* LEFT: copy */}
        <div className="px-6 pb-12 pt-8 md:pl-20 md:pr-0 md:pt-0">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            Join Thrive as an Independent
          </h1>

          <h2
            className="mt-1 font-bold leading-tight"
            style={{ color: "#00A8FF", fontSize: "clamp(36px, 6vw, 60px)" }}
          >
            Medical Examiner
          </h2>

          <p className="mt-4 text-base text-[#636363] sm:text-lg">
            Trusted by 100+ Canadian insurers and legal
            <br className="hidden md:block" />
            teams for expert medical evaluations.
          </p>

          <form action={createRoute(URLS.LOGIN)}>
            <button
              className="mt-6 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/40 sm:px-8 sm:py-4 sm:text-base"
              style={{ background: "linear-gradient(270deg, #89D7FF 0%, #00A8FF 100%)" }}
            >
              Let&apos;s Get Started
              <ArrowRight size={18} strokeWidth={3} className="sm:size-5" />
            </button>
          </form>

          <div className="mt-8 sm:mt-10">
            <h3 className="text-base font-semibold text-black sm:text-lg">
              Fully Compliant &amp; Confidential
            </h3>
            <ul className="mt-3 space-y-3">
              {MedicalExaminerFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check size={14} strokeWidth={4} style={{ color: "#00A8FF" }} />
                  <span className="text-sm leading-relaxed text-[#333333] sm:text-[15px]">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT: hero image (blue circle is baked into the asset) */}
        <div className="order-first md:order-none md:h-full w-full flex justify-end items-end">
          <div className="relative z-[1] h-full w-full">
            <Image
              src="https://public-thrive-assets.s3.eu-north-1.amazonaws.com/examiner-home.png"
              alt="Hero"
              fill
              priority
              className="object-contain h-full w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;
