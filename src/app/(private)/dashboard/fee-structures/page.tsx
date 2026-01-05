import { Metadata } from "next";

import { DashboardShell } from "@/layouts/dashboard";
import { listFeeStructuresAction } from "@/domains/fee-structures/actions";
import { FeeStructuresPageContent } from "@/domains/fee-structures/components";

export const metadata: Metadata = {
  title: "Fee Structures | Thrive Admin",
  description: "Manage fee structures in the Thrive Admin dashboard.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ status?: string; search?: string }>;
};

export default async function FeeStructuresPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status =
    sp.status === "DRAFT" || sp.status === "ACTIVE" || sp.status === "ARCHIVED"
      ? sp.status
      : "ALL";
  const search = typeof sp.search === "string" ? sp.search : "";

  const result = await listFeeStructuresAction({ status, search });

  if (!result.success) {
    const errorResult = result as { success: false; error: string };
    return (
      <DashboardShell>
        <div className="space-y-6">
          <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight">
            Fee Structures
          </h1>
          <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600 font-poppins">
              {errorResult.error || "Error fetching fee structures"}
            </p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <FeeStructuresPageContent
        feeStructures={result.data}
        initialStatus={status as any}
        initialSearch={search}
      />
    </DashboardShell>
  );
}
