/**
 * Phone number related types
 */

import { PhoneNumber } from "libphonenumber-js";

/**
 * Phone number string (digits only)
 */
export type PhoneDigits = string;

/**
 * Phone number with country code
 */
export type PhoneWithCountryCode = string;

/**
 * Parsed phone number object
 */
export type ParsedPhoneNumber = PhoneNumber | null;

