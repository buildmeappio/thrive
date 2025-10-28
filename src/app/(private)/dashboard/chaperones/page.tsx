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
        <div className="mb-6">
          <p>Error fetching chaperones</p>
        </div>
      </DashboardShell>
    );
  }
  return (
    <DashboardShell>
      <div className="mb-6">
        <ChaperoneComponent chaperones={chaperones.result} />
      </div>
    </DashboardShell>
  );
};

export default Page;
