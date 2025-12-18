import env from '@/config/env';

export const createImagePath = (imageName: string): string => {
  const baseUrl = env.NEXT_PUBLIC_CDN_URL || '';
  return `${baseUrl}/images/${imageName}`;
};
