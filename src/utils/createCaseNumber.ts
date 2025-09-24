import prisma from '@/lib/prisma';

export const createCaseNumber = async (caseTypeId: string): Promise<string> => {
  const caseType = await prisma.caseType.findUnique({
    where: { id: caseTypeId },
    select: { name: true },
  });

  if (!caseType) {
    throw new Error('Case type not found');
  }

  const prefix = caseType.name.slice(0, 3).toUpperCase();
  const year = new Date().getFullYear().toString().slice(-2);

  return await prisma.$transaction(async tx => {
    const lastExam = await tx.examination.findFirst({
      where: {
        case: { caseTypeId },
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
