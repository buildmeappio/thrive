import { getE164PhoneNumber } from '@/components/PhoneNumber';

export class InputService {
  static sanitizeCompanyName(value: string): string {
    // Only allow alphabets and spaces, max 25 characters
    let sanitized = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 25);
    // Remove leading spaces
    sanitized = sanitized.replace(/^\s+/, '');
    return sanitized;
  }

  static sanitizeContactPerson(value: string): string {
    // Only allow alphabets and spaces, max 25 characters
    let sanitized = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 25);
    // Remove leading spaces
    sanitized = sanitized.replace(/^\s+/, '');
    return sanitized;
  }

  static sanitizeEmail(value: string): string {
    // Remove all spaces immediately
    return value.replace(/\s/g, '');
  }

  static sanitizePhone(value: string): string {
    // Convert to E.164 format for storage (e.g., +11234567890)
    // This ensures consistent format in the database
    const e164Format = getE164PhoneNumber(value);
    if (e164Format) {
      return e164Format;
    }
    // If conversion fails, return the formatted value as-is
    // The PhoneInput component handles the formatting
    return value;
  }

  static trimTrailingSpaces(value: string): string {
    return value.replace(/\s+$/, '').trim();
  }
}
