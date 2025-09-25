import prisma from '@/lib/prisma';
type CaseType = { id: string; label: string };

export const createCaseNumber = async ({ id, label }: CaseType): Promise<string> => {
  const prefix = label.slice(0, 3).toUpperCase();
  const year = new Date().getFullYear().toString().slice(-2);

  return await prisma.$transaction(async tx => {
    const lastExam = await tx.examination.findFirst({
      where: {
        case: { id },
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

    const seqStr = String(nextSeq).padStart(4, '0');
    return `${prefix}-${year}-${seqStr}`;
  });
};
