export class InputService {
  static sanitizeCompanyName(value: string): string {
    // Only allow alphabets and spaces, max 25 characters
    let sanitized = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 25);
    // Remove leading spaces
    sanitized = sanitized.replace(/^\s+/, "");
    return sanitized;
  }

  static sanitizeContactPerson(value: string): string {
    // Only allow alphabets and spaces, max 25 characters
    let sanitized = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 25);
    // Remove leading spaces
    sanitized = sanitized.replace(/^\s+/, "");
    return sanitized;
  }

  static sanitizeEmail(value: string): string {
    // Remove all spaces immediately
    return value.replace(/\s/g, "");
  }

  static sanitizePhone(value: string): string {
    // Allow numbers and + (only at the start)
    let filtered = value.replace(/[^0-9+]/g, "");

    // If + exists, ensure it's only at the start
    if (filtered.includes("+")) {
      const plusCount = (filtered.match(/\+/g) || []).length;
      // If there are multiple +, keep only the first one
      if (plusCount > 1) {
        filtered = "+" + filtered.replace(/\+/g, "");
      } else if (!filtered.startsWith("+")) {
        // Move + to the start if it's not there
        filtered = "+" + filtered.replace(/\+/g, "");
      }
    }

    // Limit phone number length (max 15 digits including country code)
    if (filtered.length > 16) {
      filtered = filtered.slice(0, 16);
    }

    return filtered;
  }

  static trimTrailingSpaces(value: string): string {
    return value.replace(/\s+$/, "").trim();
  }
}
