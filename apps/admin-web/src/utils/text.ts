// Utility function to capitalize first letter of each word
export function capitalizeWords(text: string): string {
  if (!text) return text;
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Utility function to format text from database: remove _, -, and capitalize each word
export function formatText(str: string): string {
  if (!str) return str;
  return str
    .replace(/[-_]/g, ' ') // Replace - and _ with spaces
    .split(' ')
    .filter(word => word.length > 0) // Remove empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Utility function to format a full name from firstName and lastName
// Ensures each word in both names is properly capitalized
export function formatFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  if (!firstName && !lastName) return '';

  const formattedFirst = firstName ? capitalizeWords(firstName.trim()) : '';
  const formattedLast = lastName ? capitalizeWords(lastName.trim()) : '';

  return [formattedFirst, formattedLast].filter(Boolean).join(' ');
}

// Utility function to format document filenames
// Removes numeric prefix, capitalizes first letter, and truncates if needed
export function formatDocumentFilename(filename: string, maxLength: number = 45): string {
  if (!filename) return filename;

  // Remove file extension temporarily
  const lastDotIndex = filename.lastIndexOf('.');
  const nameWithoutExt = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';

  // Remove numeric prefix (everything before the first alphabet character)
  // Match pattern: digits followed by optional dash/underscore, then find first letter
  const match = nameWithoutExt.match(/^\d+[-_]?([A-Za-z].*)$/);
  let cleanedName = match ? match[1] : nameWithoutExt;

  // If no match found, try to find first alphabet character
  if (cleanedName === nameWithoutExt) {
    const firstLetterIndex = nameWithoutExt.search(/[A-Za-z]/);
    if (firstLetterIndex > 0) {
      cleanedName = nameWithoutExt.substring(firstLetterIndex);
    }
  }

  // Capitalize first letter if it's lowercase
  if (cleanedName && cleanedName.length > 0) {
    cleanedName = cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1);
  }

  // Truncate if too long
  if (cleanedName.length > maxLength) {
    cleanedName = cleanedName.substring(0, maxLength - 3) + '...';
  }

  return cleanedName + extension;
}
