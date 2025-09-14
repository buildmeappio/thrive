import { OrganizationRow } from "./columns";
import OrganizationTableClient from "./OrganizationTableClient";
import { DashboardShell } from "@/layouts/dashboard";

type OrganizationListProps = {
  data: OrganizationRow[];
};

const OrganizationList = async ({ data }: OrganizationListProps) => {
  return (
    <DashboardShell
      title={
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-[36px] font-semibold text-black font-poppins">
            New{" "}
            <span className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text text-transparent">
              Organizations
            </span>
          </h1>
          <p className="text-[#676767] font-poppins font-normal text-[18px] leading-none">
            View all new organizations, manage requests and track statuses.
          </p>
        </div>
      }
    >
      <OrganizationTableClient data={data} />
    </DashboardShell>
  );
};

export default OrganizationList;
