// domains/case/actions/listCaseStatuses.ts
"use server";
import prisma from "@/lib/db";
export default async function listCaseStatuses(): Promise<string[]> {
  const rows = await prisma.caseStatus.findMany({
    where: {
      deletedAt: null,
    },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return rows.map((r) => r.name);
}
