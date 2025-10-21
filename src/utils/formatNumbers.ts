import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';
import log from './log';

export const getE164PhoneNumber = (value: string | undefined): string | null => {
  if (!value) return null;

  try {
    const digitsOnly = value.replace(/\D/g, '');

    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      const phoneNumber = parsePhoneNumberFromString(`+${digitsOnly}`, 'CA');
      return phoneNumber?.format('E.164') || null;
    }

    if (digitsOnly.length === 10) {
      const phoneNumber = parsePhoneNumberFromString(digitsOnly, 'CA');
      return phoneNumber?.format('E.164') || null;
    }

    return null;
  } catch {
    log.error('Error parsing phone number to E.164:', value);
    return null;
  }
};

export const formatE164ForDisplay = (e164Value: string | undefined | null): string | null => {
  if (!e164Value) return null;

  try {
    const phoneNumber = parsePhoneNumberFromString(e164Value);

    if (phoneNumber?.isValid()) {
      const nationalFormat = phoneNumber.format('NATIONAL');

      return `+${phoneNumber.countryCallingCode} ${nationalFormat}`;
    }

    return e164Value;
  } catch {
    log.error('Error formatting E.164 number for display:', e164Value);
    return e164Value;
  }
};

export const validateCanadianPhoneNumber = (value: string | undefined): boolean => {
  if (!value) return false;

  try {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return isValidPhoneNumber(`+${digitsOnly}`, 'CA');
    }

    if (digitsOnly.length === 10) {
      return isValidPhoneNumber(`+1${digitsOnly}`, 'CA');
    }

    return false;
  } catch {
    return false;
  }
};
