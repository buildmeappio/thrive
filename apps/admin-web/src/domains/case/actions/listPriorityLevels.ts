// domains/case/actions/listPriorityLevels.ts
'use server';

export default async function listPriorityLevels(): Promise<string[]> {
  // Return the predefined priority levels from the enum
  return ['HIGH', 'MEDIUM', 'LOW'];
}
