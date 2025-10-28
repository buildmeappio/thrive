import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import TransporterDetail from "@/domains/transporter/components/TransporterDetail";
import { getTransporterById } from "@/domains/transporter/server/actions";
import { TransporterData } from "@/domains/transporter/types/TransporterData";
import { DashboardShell } from "@/layouts/dashboard";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getTransporterById(params.id);

  if (!result.success) {
    return {
      title: "Transporter Not Found | Thrive Admin",
    };
  }

  return {
    title: `${result.data.companyName} | Thrive Admin`,
    description: `Transporter details for ${result.data.companyName}`,
  };
}

export default async function TransporterDetailPage({ params }: Props) {
  const result = await getTransporterById(params.id);

  if (!result.success) {
    notFound();
  }

  return (
    <DashboardShell>
      <TransporterDetail
        transporter={result.data as unknown as TransporterData}
      />
    </DashboardShell>
  );
}
