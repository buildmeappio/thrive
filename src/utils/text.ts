export function capitalizeWords(str: string | null | undefined): string {
  if (!str) return "N/A";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Utility function to truncate text with ellipsis
export function truncateText(
  text: string | null | undefined,
  maxLength: number = 28
): string {
  if (!text) return "N/A";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
