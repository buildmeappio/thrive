import React from "react";
import type { DashboardPageProps } from "~/types";
import { DashboardPageClient } from "~/components/dashboard/DashboardPageClient";

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { userType } = await params;
  return <DashboardPageClient userType={userType} />;
}
