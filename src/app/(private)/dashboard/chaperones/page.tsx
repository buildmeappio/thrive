import { Metadata } from "next";
import { DashboardShell } from "@/layouts/dashboard";
import ChaperoneComponent from "@/domains/services/components/Chaperone";
import { getChaperones } from "@/domains/services/actions";

export const metadata: Metadata = {
  title: "Chaperone | Thrive Admin",
  description: "Manage chaperones in the Thrive Admin dashboard.",
};

export const dynamic = "force-dynamic";

const Page = async () => {
  const chaperones = await getChaperones();

  if (!chaperones.success) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
                Chaperones
              </h1>
            </div>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">Error fetching chaperones</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <ChaperoneComponent chaperones={chaperones.result} />
    </DashboardShell>
  );
};

export default Page;
