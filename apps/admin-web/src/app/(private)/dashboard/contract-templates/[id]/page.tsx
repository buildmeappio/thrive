import { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/layouts/dashboard";
import { getContractTemplateAction } from "@/domains/contract-templates/actions";
import ContractTemplateEditContent from "@/domains/contract-templates/components/ContractTemplateEditContent";

export const metadata: Metadata = {
  title: "Contract Template | Thrive Admin",
  description: "Edit contract template in the Thrive Admin dashboard.",
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ContractTemplateEditPage({ params }: Props) {
  const { id } = await params;

  const result = await getContractTemplateAction(id);

  if (!result.success) {
    notFound();
  }

  return (
    <DashboardShell>
      <ContractTemplateEditContent template={result.data} />
    </DashboardShell>
  );
}
