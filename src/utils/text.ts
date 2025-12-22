export function capitalizeWords(str: string | null | undefined): string {
  if (!str) return "N/A";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Capitalize first letter of a string (e.g., "mahroz" -> "Mahroz")
export function capitalizeFirstLetter(str: string | null | undefined): string {
  if (!str || str.length === 0) return str || "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Utility function to truncate text with ellipsis
export function truncateText(
  text: string | null | undefined,
  maxLength: number = 28,
): string {
  if (!text) return "N/A";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Extract first name from full name
export function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return "N/A";
  const nameParts = fullName.trim().split(/\s+/);
  return nameParts[0] || "N/A";
}
