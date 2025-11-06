export function removeUUIDLanguages(languagesResponse: {
  success: boolean;
  result: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }[];
}) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const filteredResult = languagesResponse.result.filter(lang => !uuidRegex.test(lang.name));

  return {
    ...languagesResponse,
    result: filteredResult,
  };
}

// Simpler function that works directly with Language array
export function filterUUIDLanguages<T extends { name: string }>(languages: T[]): T[] {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return languages.filter(lang => !uuidRegex.test(lang.name));
}

