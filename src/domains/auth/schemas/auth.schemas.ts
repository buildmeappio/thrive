import { z } from "zod";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { validateLicenseField } from "@/utils/inputValidation";

export const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const step1PersonalInfoSchema = z.object({
  firstName: z
    .string()
    .transform((val) => val.trim()) // Trim whitespace
    .refine((val) => val.length > 0, {
      message: "First name is required",
    })
    .refine((val) => val.length >= 2, {
      message: "First name must be at least 2 characters",
    })
    .refine((val) => val.length <= 50, {
      message: "First name must be less than 50 characters",
    })
    .refine((val) => !/^\s+$/.test(val), {
      message: "First name cannot contain only spaces",
    })
    .refine((val) => /^[a-zA-Z\s'.-]+$/.test(val), {
      message:
        "First name can only contain letters, spaces, apostrophes, hyphens, and periods",
    })
    .refine(
      (val) => {
        // Must contain at least one letter
        if (!/[a-zA-Z]/.test(val)) {
          return false;
        }
        // Cannot start or end with special characters or spaces
        if (/^['-.\s]/.test(val) || /['-.\s]$/.test(val)) {
          return false;
        }
        // Cannot have consecutive special characters
        if (/['-]{2,}/.test(val) || /\.{2,}/.test(val)) {
          return false;
        }
        return true;
      },
      {
        message:
          "First name must contain at least one letter and cannot start/end with special characters",
      },
    ),
  lastName: z
    .string()
    .transform((val) => val.trim()) // Trim whitespace
    .refine((val) => val.length > 0, {
      message: "Last name is required",
    })
    .refine((val) => val.length >= 2, {
      message: "Last name must be at least 2 characters",
    })
    .refine((val) => val.length <= 50, {
      message: "Last name must be less than 50 characters",
    })
    .refine((val) => !/^\s+$/.test(val), {
      message: "Last name cannot contain only spaces",
    })
    .refine((val) => /^[a-zA-Z\s'.-]+$/.test(val), {
      message:
        "Last name can only contain letters, spaces, apostrophes, hyphens, and periods",
    })
    .refine(
      (val) => {
        // Must contain at least one letter
        if (!/[a-zA-Z]/.test(val)) {
          return false;
        }
        // Cannot start or end with special characters or spaces
        if (/^['-.\s]/.test(val) || /['-.\s]$/.test(val)) {
          return false;
        }
        // Cannot have consecutive special characters
        if (/['-]{2,}/.test(val) || /\.{2,}/.test(val)) {
          return false;
        }
        return true;
      },
      {
        message:
          "Last name must contain at least one letter and cannot start/end with special characters",
      },
    ),
  phoneNumber: z
    .string()
    .min(1, { message: "Cell phone is required" })
    .refine(
      (val) => {
        // Only validate format if field has a value
        if (!val || val.trim().length === 0) {
          return true; // Let min(1) handle empty validation
        }
        try {
          // Handle both formats: "+1 (123) 456-7890" and raw digits
          const cleanVal = val.replace(/^\+1\s*/, "").replace(/\D/g, "");
          if (cleanVal.length < 5) {
            return false;
          }
          const phone = parsePhoneNumberWithError(`+1${cleanVal}`);
          if (phone.countryCallingCode === "1") {
            return true;
          }
          return false;
        } catch (error) {
          console.error(error);
          return false;
        }
      },
      { message: "Please enter a valid phone number" },
    ),
  landlineNumber: z
    .string()
    .min(1, { message: "Work phone is required" })
    .refine(
      (val) => {
        // Only validate format if field has a value
        if (!val || val.trim().length === 0) {
          return true; // Let min(1) handle empty validation
        }
        try {
          // Handle both formats: "+1 (123) 456-7890" and raw digits
          const cleanVal = val?.replace(/^\+1\s*/, "").replace(/\D/g, "");
          if (cleanVal.length < 5) {
            return false;
          }
          const phone = parsePhoneNumberWithError(`+1${cleanVal}`);
          return phone.countryCallingCode === "1";
        } catch (error) {
          console.error(error);
          return false;
        }
      },
      { message: "Please enter a valid landline number" },
    ),

  emailAddress: z
    .string()
    .min(1, { message: "Email address is required" })
    .email({ message: "Please enter a valid email address" }),
  city: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: "City is required",
    })
    .refine((val) => val.length >= 2, {
      message: "City must be at least 2 characters",
    })
    .refine((val) => val.length <= 100, {
      message: "City must be less than 100 characters",
    }),
  province: z.string().min(1, { message: "Province is required" }),
  languagesSpoken: z
    .array(z.string())
    .min(1, { message: "At least one language must be selected" }),
});

export type Step1PersonalInfoInput = z.infer<typeof step1PersonalInfoSchema>;

export const step2AddressSchema = z.object({
  address: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: "Address is required",
    })
    .refine((val) => val.length >= 10, {
      message: "Address must be at least 10 characters",
    }),
  street: z
    .string()
    .transform((val) => val.trim())
    .optional()
    .default(""),
  suite: z
    .string()
    .transform((val) => val.trim())
    .optional()
    .default(""),
  postalCode: z
    .string()
    .transform((val) => val.trim())
    .optional()
    .default(""),
  province: z.string().optional().default(""),
  city: z
    .string()
    .transform((val) => val.trim())
    .optional()
    .default(""),
});

export type Step2AddressInput = z.infer<typeof step2AddressSchema>;

export const step2MedicalCredentialsSchema = z.object({
  licenseNumber: z
    .string()
    .transform((val) => val.trim()) // Trim whitespace
    .refine((val) => val.length > 0, {
      message: "Medical license number is required",
    })
    .refine((val) => val.length >= 5, {
      message: "Medical license number must be at least 5 characters",
    })
    .refine((val) => val.length <= 50, {
      message: "Medical license number must be less than 50 characters",
    })
    .refine((val) => !/^\s+$/.test(val), {
      message: "Medical license number cannot contain only spaces",
    })
    .refine(
      (val) => {
        const error = validateLicenseField(val);
        return error === null;
      },
      {
        message: "Please enter a valid medical license number",
      },
    ),
  licenseIssuingProvince: z
    .string()
    .min(1, { message: "License issuing province is required" }),
  medicalSpecialty: z
    .array(z.string())
    .min(1, { message: "At least one medical specialty is required" }),
  yearsOfIMEExperience: z
    .string({ error: "Years of IME experience is required" })
    .min(1, { message: "Years of IME experience is required" }),
  // licenseExpiryDate: z
  //   .string({ error: "License expiry date is required" })
  //   .min(1, { message: "License expiry date is required" }),
  medicalLicense: z
    .any()
    .optional()
    .refine(
      (val) => {
        // If value is provided, validate it
        if (!val || val === "" || (Array.isArray(val) && val.length === 0)) {
          return true; // Optional, so empty is valid
        }

        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        // Handle array of files
        if (Array.isArray(val)) {
          return val.every((file) => {
            if (!file) return false;
            // Check if it's a File object
            if (file instanceof File) {
              return allowedTypes.includes(file.type);
            }
            // Check if it's an existing file object with type property
            if (file.type) {
              return allowedTypes.includes(file.type);
            }
            // Allow existing files without type check
            return true;
          });
        }

        // Handle single file (backward compatibility)
        // Check if it's a File object
        if (val instanceof File) {
          return allowedTypes.includes(val.type);
        }
        // Check if it's an existing file object with type property
        if (val.type) {
          return allowedTypes.includes(val.type);
        }
        return true; // Allow existing files without type check
      },
      {
        message: "Medical documents must be PDF, DOC, or DOCX files",
      },
    ),
});

export type Step2MedicalCredentialsInput = z.infer<
  typeof step2MedicalCredentialsSchema
>;

export const verificationDocumentsSchema = z.object({
  medicalLicense: z
    .any()
    .refine(
      (val) => {
        // Check if it's an array
        if (Array.isArray(val)) {
          return val.length > 0;
        }
        // Backward compatibility: allow single file
        return val !== null && val !== undefined && val !== "";
      },
      {
        message: "At least one medical document is required",
      },
    )
    .refine(
      (val) => {
        if (!val || val === "") return false;

        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        // Handle array of files
        if (Array.isArray(val)) {
          return val.every((file) => {
            if (!file) return false;
            // Check if it's a File object
            if (file instanceof File) {
              return allowedTypes.includes(file.type);
            }
            // Check if it's an existing file object with type property
            if (file.type) {
              return allowedTypes.includes(file.type);
            }
            // Allow existing files without type check
            return true;
          });
        }

        // Handle single file (backward compatibility)
        // Check if it's a File object
        if (val instanceof File) {
          return allowedTypes.includes(val.type);
        }
        // Check if it's an existing file object with type property
        if (val.type) {
          return allowedTypes.includes(val.type);
        }
        return true; // Allow existing files without type check
      },
      {
        message: "Medical documents must be PDF, DOC, or DOCX files",
      },
    ),
});

export type VerificationDocumentsInput = z.infer<
  typeof verificationDocumentsSchema
>;

export const step3IMEExperienceSchema = z.object({
  imesCompleted: z
    .string()
    .min(1, { message: "Please specify if you have completed any IMEs" }),
  currentlyConductingIMEs: z
    .string()
    .min(1, { message: "Please specify if you are currently conducting IMEs" }),
  assessmentTypes: z
    .array(z.string())
    .min(1, { message: "Please select at least one assessment type" }),
  // redactedIMEReport removed - not collected in this step
});

export type Step3IMEExperienceInput = z.infer<typeof step3IMEExperienceSchema>;

export const step4ExperienceDetailsSchema = z.object({
  experienceDetails: z
    .string()
    .min(50, {
      message: "Experience details must be at least 50 characters",
    })
    .max(500, {
      message: "Experience details must be less than 500 characters",
    }),
});

export type Step4ExperienceDetailsInput = z.infer<
  typeof step4ExperienceDetailsSchema
>;

export const step6LegalSchema = z.object({
  // signedNDA: z.any().refine((val) => val !== null, {
  //   error: "Signed NDA document is required",
  // }),
  // insuranceProof: z.any().refine((val) => val !== null, {
  //   error: "Insurance proof document is required",
  // }),
  consentBackgroundVerification: z.boolean().refine((val) => val === true, {
    message: "You must consent to background verification",
  }),
  agreeTermsConditions: z.boolean().refine((val) => val === true, {
    message: "You must agree to terms and conditions",
  }),
});

export type Step6LegalInput = z.infer<typeof step6LegalSchema>;

export const step7PaymentDetailsSchema = z.object({
  IMEFee: z
    .string()
    .min(1, { message: "Standard IME fee is required" })
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      { message: "Please enter a valid fee amount" },
    ),
  recordReviewFee: z
    .string()
    .min(1, { message: "Record review fee is required" })
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      { message: "Please enter a valid fee amount" },
    ),
  hourlyRate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      { message: "Please enter a valid hourly rate" },
    ),
  cancellationFee: z
    .string()
    .min(1, { message: "Cancellation fee is required" })
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      { message: "Please enter a valid fee amount" },
    ),
});

export type Step7PaymentDetailsInput = z.infer<
  typeof step7PaymentDetailsSchema
>;

export const step9PasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type Step9PasswordInput = z.infer<typeof step9PasswordSchema>;
