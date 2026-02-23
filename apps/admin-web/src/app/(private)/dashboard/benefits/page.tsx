import { Metadata } from "next";
import { DashboardShell } from "@/layouts/dashboard";
import BenefitsList from "@/domains/benefits/components/BenefitsList";
import {
  getBenefitsAction,
  getExaminationTypesAction,
} from "@/domains/benefits/actions";

export const metadata: Metadata = {
  title: "Benefits | Thrive Admin",
  description: "Manage benefits in the Thrive Admin dashboard.",
};

export const dynamic = "force-dynamic";

const Page = async () => {
  const [benefitsResponse, examTypesResponse] = await Promise.all([
    getBenefitsAction(),
    getExaminationTypesAction(),
  ]);

  if (!benefitsResponse.success) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
              All Benefits Type
            </h1>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">Error fetching benefits</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const examinationTypes =
    examTypesResponse.success && examTypesResponse.data
      ? examTypesResponse.data
      : [];

  return (
    <DashboardShell>
      <BenefitsList
        benefits={benefitsResponse.data || []}
        examinationTypes={examinationTypes}
      />
    </DashboardShell>
  );
};

export default Page;
