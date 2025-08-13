import React from "react";
import type { GettingStartedPageProps } from "@/shared//types";
import { GettingStartedPageClient } from "@/shared/components/gettingStarted/GettingStartedPageClient";

export default async function GettingStartedPage({
  params,
}: GettingStartedPageProps) {
  const { userType } = await params;
  return <GettingStartedPageClient userType={userType} />;
}
