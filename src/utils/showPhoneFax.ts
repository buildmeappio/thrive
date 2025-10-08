export const showPhoneFax = (number?: string | null) => {
  if (!number) return null;
  return `+1 ${number}`;
};
