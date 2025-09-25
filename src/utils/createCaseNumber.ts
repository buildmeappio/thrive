import type { Prisma } from '@prisma/client';

type CaseType = { id: string; label: string };

export const createCaseNumber = async (tx: Prisma.TransactionClient, { id, label }: CaseType) => {
  const prefix = label.slice(0, 3).toUpperCase();
  const year = new Date().getFullYear().toString();

  const lastExam = await tx.examination.findFirst({
    where: {
      case: { caseTypeId: id },
      caseNumber: { startsWith: `${prefix}-${year}-` },
    },
    orderBy: { createdAt: 'desc' },
    select: { caseNumber: true },
  });

  let nextSeq = 1;
  if (lastExam?.caseNumber) {
    const parts = lastExam.caseNumber.split('-');
    const lastSeq = parseInt(parts[2], 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  return `${prefix}-${year}-${nextSeq}`;
};
