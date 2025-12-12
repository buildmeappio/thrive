// domains/case/actions/listCaseTypes.ts
"use server";
import prisma from "@/lib/db";
export default async function listCaseTypes(): Promise<string[]> {
  const rows = await prisma.caseType.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return rows.map((r) => r.name);
}
