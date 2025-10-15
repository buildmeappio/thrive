export const createImagePath = (imageName: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_CDN_URL || '';
  return `${baseUrl}/images/${imageName}`;
};
