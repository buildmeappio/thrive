/**
 * Capitalizes the first letter of each word in a string
 */
export function capitalizeWords(str: string | null | undefined): string {
  if (!str) return "N/A";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
