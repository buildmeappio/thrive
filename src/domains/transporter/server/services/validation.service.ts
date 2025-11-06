import { validateCanadianPhoneNumber } from "@/components/PhoneNumber";

export class ValidationService {
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email) {
      return { isValid: false, error: "Email is required" };
    }

    if (!email.includes("@")) {
      return { isValid: false, error: "Please enter a valid email address" };
    }

    const [localPart, domain] = email.split("@");
    if (!localPart || !domain || !domain.includes(".")) {
      return { isValid: false, error: "Please enter a valid email address" };
    }

    // Must have at least one letter (a-z or A-Z) in the local part before @
    const hasLetter = /[a-zA-Z]/.test(localPart);
    const validLocalPart = /^[a-zA-Z0-9._-]+$/.test(localPart);
    const validDomain = /^[^\s@]+\.[^\s@]+$/.test(domain);

    if (!hasLetter || !validLocalPart || !validDomain) {
      return { isValid: false, error: "Please enter a valid email address" };
    }

    return { isValid: true };
  }

  static validatePhone(phone: string): { isValid: boolean; error?: string } {
    if (!phone) {
      return { isValid: false, error: "Phone is required" };
    }

    if (!validateCanadianPhoneNumber(phone)) {
      return {
        isValid: false,
        error: "Please enter a valid Canadian phone number",
      };
    }

    return { isValid: true };
  }

  static validateCompanyName(name: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!name || !name.trim()) {
      return { isValid: false, error: "Company name is required" };
    }

    if (this.isOnlySpaces(name)) {
      return { isValid: false, error: "Company name cannot be only spaces" };
    }

    if (name.length > 25) {
      return {
        isValid: false,
        error: "Company name must be 25 characters or less",
      };
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return {
        isValid: false,
        error: "Company name can only contain letters and spaces",
      };
    }

    return { isValid: true };
  }

  static validateContactPerson(name: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!name || !name.trim()) {
      return { isValid: false, error: "Contact person is required" };
    }

    if (this.isOnlySpaces(name)) {
      return { isValid: false, error: "Contact person cannot be only spaces" };
    }

    if (name.length > 25) {
      return {
        isValid: false,
        error: "Contact person must be 25 characters or less",
      };
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return {
        isValid: false,
        error: "Contact person can only contain letters and spaces",
      };
    }

    return { isValid: true };
  }

  static validateServiceAreas(serviceAreas: any[]): {
    isValid: boolean;
    error?: string;
  } {
    if (!serviceAreas || serviceAreas.length === 0) {
      return {
        isValid: false,
        error: "Please select at least one service province",
      };
    }

    return { isValid: true };
  }

  static validateTransporterData(data: {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    serviceAreas: any[];
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const companyNameValidation = this.validateCompanyName(data.companyName);
    if (!companyNameValidation.isValid) {
      errors.push(companyNameValidation.error!);
    }

    const contactPersonValidation = this.validateContactPerson(
      data.contactPerson
    );
    if (!contactPersonValidation.isValid) {
      errors.push(contactPersonValidation.error!);
    }

    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(emailValidation.error!);
    }

    const phoneValidation = this.validatePhone(data.phone);
    if (!phoneValidation.isValid) {
      errors.push(phoneValidation.error!);
    }

    const serviceAreasValidation = this.validateServiceAreas(data.serviceAreas);
    if (!serviceAreasValidation.isValid) {
      errors.push(serviceAreasValidation.error!);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static isOnlySpaces(value: string): boolean {
    return value.trim().length === 0 && value.length > 0;
  }
}
