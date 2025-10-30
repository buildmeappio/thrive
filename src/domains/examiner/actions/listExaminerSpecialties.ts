"use server";

import prisma from "@/lib/db";

export default async function listExaminerSpecialties(): Promise<string[]> {
  const examiners = await prisma.examinerProfile.findMany({
    select: { specialties: true },
  });
  
  const specialtiesSet = new Set<string>();
  examiners.forEach((examiner) => {
    if (examiner.specialties) {
      examiner.specialties.forEach((specialty) => specialtiesSet.add(specialty));
    }
  });
  
  return Array.from(specialtiesSet).sort();
}
