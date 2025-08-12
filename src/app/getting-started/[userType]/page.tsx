import React from "react";
import type { GettingStartedPageProps } from "~/types";
import { GettingStartedPageClient } from "~/components/gettingStarted/GettingStartedPageClient";

export default async function GettingStartedPage({
  params,
}: GettingStartedPageProps) {
  const { userType } = await params;
  return <GettingStartedPageClient userType={userType} />;
}
