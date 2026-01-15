import { Metadata } from "next";
import organizationActions from "@/domains/organization/actions";
import CreateOrganizationForm from "@/domains/organization/components/CreateOrganizationForm";

export const metadata: Metadata = {
  title: "Create Organization | Thrive Admin",
  description: "Create a new organization",
};

export const dynamic = "force-dynamic";

const Page = async () => {
  const types = await organizationActions.getOrganizationTypes();
  const typeNames = types.map((t) => t.name);

  return (
    <CreateOrganizationForm
      organizationTypes={typeNames}
      createOrganizationAction={organizationActions.createOrganization}
    />
  );
};

export default Page;
