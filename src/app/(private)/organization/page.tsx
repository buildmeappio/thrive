import organizationActions from "@/domains/organization/actions";
import OrganizationTable from "@/domains/organization/components/OrganizationTable";
import { OrganizationData } from "@/domains/organization/types/OrganizationData";
import { DashboardShell } from "@/layouts/dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization | Thrive Admin",
  description: "Organization",
};

export const dynamic = "force-dynamic";

const Page = async () => {
  const [orgs, types] = await Promise.all([
    organizationActions.getOrganizations(),
    organizationActions.getOrganizationTypes(),
  ]);

  const typeNames = types.map((t) => t.name);

  const data = orgs.map((org) => ({
    id: org.id,
    name: org.name,
    website: org.website,
    status: org.status,
    typeName: org.type?.name ?? "",
    address: org.address ? `${org.address.street}, ${org.address.city}` : "",
    managerName: org.manager?.[0]?.account?.user?.firstName
      ? `${org.manager[0].account.user.firstName} ${org.manager[0].account.user.lastName}`
      : "",
    managerEmail: org.manager?.[0]?.account?.user?.email ?? "",
  } as OrganizationData));

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
      <div className="bg-white shadow-sm rounded-[30px] px-6 py-8">
        <OrganizationTable data={data} types={typeNames} />
      </div>
    </DashboardShell>
  );
};

export default Page;
