import OrganizationDetail from "@/domains/organization/components/OrganizationDetail";
import { notFound } from "next/navigation";
import organizationActions from "@/domains/organization/actions";

const Page = async ({ params }: { params: { id: string } }) => {
  const org = await organizationActions.getOrganizationDetails(params.id);
  if (!org) return notFound();
  return <OrganizationDetail organization={org} />;
};

export default Page;
