import { Organization, organizationHandlers } from "@/domains/organization";
import { OrganizationRow } from "@/domains/organization/components/columns";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization | Thrive Admin",
  description: "Organization",
};

const Page = async () => {
  // Fetch organizations from the server
  const orgs = await organizationHandlers.getOrganizations();

  // Map to table row shape
  const data: OrganizationRow[] = orgs.map((org) => ({
    id: org.id,
    name: org.name,
    website: org.website,
    status: org.status,
    typeName: org.type?.name ?? "",
    address: org.address ? `${org.address.street}, ${org.address.city}` : "",
    managerName: org.manager?.[0]?.account?.user?.firstName
      ? `${org.manager[0].account.user.firstName} ${org.manager[0].account.user.lastName}`
      : "",
  }));

  return <Organization data={data} />;
};

export default Page;
