import organizationActions from "@/domains/organization/actions";
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

  return <OrganizationPageContent data={orgs} types={typeNames} />;
};

export default Page;
