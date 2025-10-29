import { ValidationService } from "../services/validation.service";
import { InputService } from "../services/input.service";
import { CreateTransporterData } from "../../types/TransporterData";

export class TransporterFormHandler {
  static validateAndSanitizeFormData(formData: {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    serviceAreas: any[];
  }): {
    isValid: boolean;
    errors: string[];
    sanitizedData?: CreateTransporterData;
  } {
    // Sanitize input data
    const sanitizedData = {
      companyName: InputService.sanitizeCompanyName(formData.companyName),
      contactPerson: InputService.sanitizeContactPerson(formData.contactPerson),
      email: InputService.sanitizeEmail(formData.email),
      phone: InputService.sanitizePhone(formData.phone),
      serviceAreas: formData.serviceAreas || [],
    };

    // Validate the sanitized data
    const validation = ValidationService.validateTransporterData(sanitizedData);

    return {
      isValid: validation.isValid,
      errors: validation.errors,
      sanitizedData: validation.isValid ? sanitizedData : undefined,
    };
  }

  static handleCompanyNameChange(value: string): string {
    return InputService.sanitizeCompanyName(value);
  }

  static handleCompanyNameBlur(value: string): string {
    return InputService.trimTrailingSpaces(value);
  }

  static handleContactPersonChange(value: string): string {
    return InputService.sanitizeContactPerson(value);
  }

  static handleContactPersonBlur(value: string): string {
    return InputService.trimTrailingSpaces(value);
  }

  static handleEmailChange(value: string): string {
    return InputService.sanitizeEmail(value);
  }

  static handlePhoneChange(value: string): string {
    return InputService.sanitizePhone(value);
  }

  static isOnlySpaces(value: string): boolean {
    return value.trim().length === 0 && value.length > 0;
  }

  static isValidEmail(email: string): boolean {
    return ValidationService.validateEmail(email).isValid;
  }

  static isValidPhone(phone: string): boolean {
    return ValidationService.validatePhone(phone).isValid;
  }
}
