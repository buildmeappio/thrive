import { Metadata } from "next";
import { DashboardShell } from "@/layouts/dashboard";

export const metadata: Metadata = {
  title: "Support | Thrive Admin",
  description: "Support",
};

export const dynamic = "force-dynamic";

const Page = () => {
  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
          Support
        </h1>
      </div>
    </DashboardShell>
  );
};

export default Page;
