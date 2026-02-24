'use server';

import getSpecialtyPreferencesHandler from '../handlers/getSpecialtyPreferences';

export const getSpecialtyPreferencesAction = async (accountId: string) => {
  try {
    return await getSpecialtyPreferencesHandler({ accountId });
  } catch (error: unknown) {
    return {
      success: false as const,
      data: null,
      message:
        (error instanceof Error ? error.message : undefined) ||
        'Failed to fetch specialty preferences',
    };
  }
};
