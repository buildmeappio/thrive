import { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/layouts/dashboard";
import BenefitForm from "@/domains/benefits/components/BenefitForm";
import { getBenefitByIdAction } from "@/domains/benefits/actions";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getBenefitByIdAction(id);

  if (!result.success || !result.data) {
    return {
      title: "Edit Benefit | Thrive Admin",
    };
  }

  return {
    title: `Edit ${result.data.benefit} | Thrive Admin`,
    description: `Edit benefit details for ${result.data.benefit}`,
  };
}

export const dynamic = "force-dynamic";

export default async function EditBenefitPage({ params }: Props) {
  const { id } = await params;
  const result = await getBenefitByIdAction(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <DashboardShell>
      <BenefitForm mode="edit" benefit={result.data} />
    </DashboardShell>
  );
}

