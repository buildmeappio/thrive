import prisma from '@/lib/db';

/**
 * Checks if an ID belongs to an ExaminerApplication or ExaminerProfile
 * @param id - The ID to check
 * @returns 'application' | 'examiner' | null
 */
export async function checkEntityType(id: string): Promise<'application' | 'examiner' | null> {
  // Check if it's an application first
  const application = await prisma.examinerApplication.findUnique({
    where: { id },
    select: { id: true },
  });

  if (application) {
    return 'application';
  }

  // Check if it's an examiner profile
  const examiner = await prisma.examinerProfile.findUnique({
    where: { id },
    select: { id: true },
  });

  if (examiner) {
    return 'examiner';
  }

  return null;
}
