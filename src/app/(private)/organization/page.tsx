import organizationActions from "@/domains/organization/actions";
import { OrganizationData } from "@/domains/organization/types/OrganizationData";
import OrganizationPageContent from "./OrganizationPageContent";
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
  const statusNames = ["PENDING", "ACCEPTED", "REJECTED"];

  const data: OrganizationData[] = orgs.map((org) => ({
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
  }));

  return <OrganizationPageContent data={data} types={typeNames} statuses={statusNames} />;
};

export default Page;
