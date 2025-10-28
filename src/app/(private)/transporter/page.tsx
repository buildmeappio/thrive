import React from "react";
import { Metadata } from "next";
import { TransporterPageContent } from "@/domains/transporter";
import { getTransporters } from "@/domains/transporter/server/actions";
import { TransporterData } from "@/domains/transporter/types/TransporterData";
import { DashboardShell } from "@/layouts/dashboard";

export const metadata: Metadata = {
  title: "Transporter | Thrive Admin",
  description: "Manage medical transportation services",
};

export const dynamic = "force-dynamic";

export default async function Transporter() {
  const result = await getTransporters(1, 10, "");
  const transporters = result.success
    ? (result.data as unknown as TransporterData[])
    : [];

  const statuses = ["ACTIVE", "SUSPENDED"];

  return (
    <DashboardShell>
      <TransporterPageContent data={transporters} statuses={statuses} />
    </DashboardShell>
  );
}
