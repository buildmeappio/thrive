/**
 * Format phone number to display format: +1 344 555 3423
 * Handles various input formats
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '-';

  // Remove all non-digit characters except the leading +
  const cleaned = phone.replace(/[^\d+]/g, '');

  if (!cleaned) return '-';

  // Handle different formats
  // If starts with +, keep it
  // If starts with 1 and is 11 digits, add +
  // Otherwise, assume it needs +1

  let digits = cleaned;

  // Remove + temporarily for processing
  if (digits.startsWith('+')) {
    digits = digits.substring(1);
  }

  // If it's 10 digits, assume it's a North American number without country code
  if (digits.length === 10) {
    digits = '1' + digits;
  }

  // If it's 11 digits and starts with 1, it's already formatted correctly
  if (digits.length === 11 && digits.startsWith('1')) {
    // Format as: +1 344 555 3423
    return `+${digits[0]} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  // If it's exactly 11 digits (any country code)
  if (digits.length === 11) {
    return `+${digits[0]} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  // For other lengths, try to format as best as possible
  if (digits.length > 11) {
    // Has country code with more digits
    const countryCode = digits.slice(0, digits.length - 10);
    const rest = digits.slice(digits.length - 10);
    return `+${countryCode} ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
  }

  // If we can't format it properly, just return with + prefix
  return `+${digits}`;
}
