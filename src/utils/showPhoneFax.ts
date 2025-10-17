export const showPhoneFax = (number?: string | null) => {
  if (!number) return null;
  if (number.startsWith('1')) {
    return `+${number}`;
  }
  return `+1 ${number}`;
};
