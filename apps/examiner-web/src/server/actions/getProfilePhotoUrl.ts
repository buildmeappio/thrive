'use server';

import { profilePhotoService } from '@/server';

export const getProfilePhotoUrlAction = async (
  profilePhotoId: string | null | undefined
): Promise<string | null> => {
  if (!profilePhotoId) {
    return null;
  }

  try {
    return await profilePhotoService.getProfilePhotoUrl(profilePhotoId);
  } catch (error) {
    console.error('Error in getProfilePhotoUrlAction:', error);
    return null;
  }
};
