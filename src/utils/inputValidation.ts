/**
 * Input Validation Utilities
 * Provides validation and sanitization functions for different input field types
 */

export type InputValidationType =
  | "name" // firstName, lastName - allows letters, spaces, hyphens, apostrophes, periods
  | "license" // licenseNumber - allows alphanumeric, spaces, hyphens, hash
  | "numeric" // Money fields - allows digits and decimal point
  | "integer" // Count fields - allows digits only
  | "banking" // Banking numbers - allows digits only
  | "address" // Address fields - allows alphanumeric, spaces, commas, periods, @, hyphens, apostrophes, #, /
  | "text" // Text areas - allows most characters but sanitizes dangerous ones
  | "email" // Email - already handled by type="email"
  | "phone" // Phone - already handled by PhoneInput component
  | "none"; // No validation

/**
 * Validation patterns for each field type
 */
const VALIDATION_PATTERNS: Record<
  Exclude<InputValidationType, "email" | "phone" | "none">,
  RegExp
> = {
  name: /^[a-zA-Z\s'.-]*$/, // Letters, spaces, apostrophes, hyphens, periods
  license: /^[a-zA-Z0-9\s#-]*$/, // Alphanumeric, spaces, hash, hyphens
  numeric: /^[0-9.]*$/, // Digits and decimal point
  integer: /^[0-9]*$/, // Digits only
  banking: /^[0-9]*$/, // Digits only
  address: /^[a-zA-Z0-9\s,.@'#/-]*$/, // Alphanumeric, spaces, commas, periods, @, apostrophes, #, /, hyphens
  text: /^[\s\S]*$/, // All characters (will sanitize dangerous ones)
};

/**
 * Sanitizes text input to remove potentially dangerous characters
 */
export function sanitizeTextInput(text: string): string {
  // Remove HTML tags and script injection attempts
  return text
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>{}[\]\\/]/g, ""); // Remove dangerous characters
}

/**
 * Validates if a character is allowed for the given validation type
 */
export function isValidCharacter(
  char: string,
  validationType: InputValidationType,
): boolean {
  if (
    validationType === "none" ||
    validationType === "email" ||
    validationType === "phone"
  ) {
    return true;
  }

  if (validationType === "text") {
    // Text areas allow most characters but we'll sanitize on blur
    return true;
  }

  const pattern = VALIDATION_PATTERNS[validationType];
  return pattern.test(char);
}

/**
 * Filters input value to only allow valid characters
 */
export function filterInputValue(
  value: string,
  validationType: InputValidationType,
): string {
  if (
    validationType === "none" ||
    validationType === "email" ||
    validationType === "phone"
  ) {
    return value;
  }

  if (validationType === "text") {
    // For text areas, we allow all input but sanitize on blur
    return value;
  }

  const pattern = VALIDATION_PATTERNS[validationType];
  return value
    .split("")
    .filter((char) => pattern.test(char))
    .join("");
}

/**
 * Handles key press events to prevent invalid characters
 */
export function handleKeyPress(
  e: React.KeyboardEvent<HTMLInputElement>,
  validationType: InputValidationType,
): void {
  // Allow control keys (backspace, delete, arrows, tab, etc.)
  const controlKeys = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Tab",
    "Home",
    "End",
    "Enter",
  ];

  if (controlKeys.includes(e.key)) {
    return;
  }

  // Allow Ctrl/Cmd combinations (for copy/paste)
  if (e.ctrlKey || e.metaKey) {
    return;
  }

  // For numeric types, allow decimal point only once
  if (validationType === "numeric" && e.key === ".") {
    const input = e.currentTarget;
    const currentValue = input.value || "";
    if (currentValue.includes(".")) {
      e.preventDefault();
      return;
    }
  }

  // Check if the character is valid
  if (!isValidCharacter(e.key, validationType)) {
    e.preventDefault();
  }
}

/**
 * Validates name fields to prevent consecutive special characters
 */
export function validateNameField(value: string): string | null {
  if (!value || value.trim() === "") {
    return null; // Empty validation will be handled by required field validation
  }

  // Check for consecutive special characters
  if (/['-]{2,}/.test(value)) {
    return "Name cannot contain consecutive special characters (e.g., --, '', ..)";
  }

  // Check for consecutive periods
  if (/\.{2,}/.test(value)) {
    return "Name cannot contain consecutive periods";
  }

  // Check if name starts or ends with special characters
  if (/^['-.\s]/.test(value)) {
    return "Name cannot start with a special character or space";
  }

  if (/['-.\s]$/.test(value)) {
    return "Name cannot end with a special character or space";
  }

  // Check if name contains only special characters and spaces
  if (/^['-.\s]+$/.test(value)) {
    return "Name must contain at least one letter";
  }

  return null; // Valid
}

/**
 * Validates license number field
 */
export function validateLicenseField(value: string): string | null {
  if (!value || value.trim() === "") {
    return null; // Empty validation will be handled by required field validation
  }

  // Check for consecutive hyphens
  if (/[-]{2,}/.test(value)) {
    return "License number cannot contain consecutive hyphens";
  }

  // Check if license starts or ends with special characters
  if (/^[-\s#]/.test(value)) {
    return "License number cannot start with a special character or space";
  }

  if (/[-\s#]$/.test(value)) {
    return "License number cannot end with a special character or space";
  }

  return null; // Valid
}

/**
 * Validates address field
 */
export function validateAddressField(value: string): string | null {
  if (!value || value.trim() === "") {
    return null; // Empty validation will be handled by required field validation
  }

  // Check for consecutive special characters
  if (/['-]{2,}/.test(value)) {
    return "Address cannot contain consecutive special characters";
  }

  if (/\.{2,}/.test(value)) {
    return "Address cannot contain consecutive periods";
  }

  if (/,{2,}/.test(value)) {
    return "Address cannot contain consecutive commas";
  }

  return null; // Valid
}

/**
 * Handles input change events to filter invalid characters
 */
export function handleInputChange(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  validationType: InputValidationType,
): string {
  const filteredValue = filterInputValue(e.target.value, validationType);

  // For numeric fields, ensure only one decimal point
  if (validationType === "numeric") {
    const parts = filteredValue.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }
  }

  return filteredValue;
}

/**
 * Validates input value based on validation type
 * Returns error message if invalid, null if valid
 */
export function validateInputValue(
  value: string,
  validationType: InputValidationType,
): string | null {
  if (
    validationType === "none" ||
    validationType === "email" ||
    validationType === "phone" ||
    validationType === "text"
  ) {
    return null;
  }

  switch (validationType) {
    case "name":
      return validateNameField(value);
    case "license":
      return validateLicenseField(value);
    case "address":
      return validateAddressField(value);
    case "numeric":
    case "integer":
    case "banking":
      // These types don't have special character validation
      return null;
    default:
      return null;
  }
}

/**
 * Sanitizes value on blur for text areas
 */
export function sanitizeOnBlur(
  value: string,
  validationType: InputValidationType,
): string {
  if (validationType === "text") {
    return sanitizeTextInput(value);
  }
  return value;
}
