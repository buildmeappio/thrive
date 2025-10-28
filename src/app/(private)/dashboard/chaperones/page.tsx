import { Metadata } from "next";
import { DashboardShell } from "@/layouts/dashboard";
import { getChaperones } from "@/domains/services/actions";
import ChaperonesPageContent from "./ChaperonePageContent";

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
    <ChaperonesPageContent 
      chaperoneList={chaperones.result || []}
    />
  );
};

export default Page;