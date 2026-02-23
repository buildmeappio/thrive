import OrganizationDetail from "@/domains/organization/components/OrganizationDetail";
import { notFound } from "next/navigation";
import organizationActions from "@/domains/organization/actions";

const Page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params; // await before use
  const org = await organizationActions.getOrganizationDetails(id);
  if (!org) return notFound();
  return <OrganizationDetail organization={org} />;
};

export default Page;
