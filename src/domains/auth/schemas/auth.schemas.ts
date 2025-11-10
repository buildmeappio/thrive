import { z } from "zod";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { validateNameField, validateLicenseField, validateAddressField } from "@/utils/inputValidation";

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
    .refine((val) => {
      const error = validateNameField(val);
      return error === null;
    }, {
      message: "Please enter a valid first name",
    }),
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
    .refine((val) => {
      const error = validateNameField(val);
      return error === null;
    }, {
      message: "Please enter a valid last name",
    }),
  phoneNumber: z
    .string()
    .min(5, { message: "Please enter a valid phone number" })
    .refine(
      (val) => {
        try {
          // Handle both formats: "+1 (123) 456-7890" and raw digits
          const cleanVal = val.replace(/^\+1\s*/, "").replace(/\D/g, "");
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
      { message: "Please enter a valid phone number" }
    ),
  landlineNumber: z
    .string()
    .min(5, { message: "Please enter a valid landline number" })
    .optional()
    .refine(
      (val) => {
        try {
          if (!val) {
            return true;
          }
          // Handle both formats: "+1 (123) 456-7890" and raw digits
          const cleanVal = val?.replace(/^\+1\s*/, "").replace(/\D/g, "");
          const phone = parsePhoneNumberWithError(`+1${cleanVal}`);
          return phone.countryCallingCode === "1";
        } catch (error) {
          console.error(error);
          return false;
        }
      },
      { message: "Please enter a valid landline number" }
    ),

  emailAddress: z
    .string()
    .email({ message: "Please enter a valid email address" }),
  provinceOfResidence: z
    .string({ error: "Province of residence is required" })
    .min(1, { message: "Province of residence is required" }),
  mailingAddress: z
    .string()
    .transform((val) => val.trim()) // Trim whitespace
    .refine((val) => val.length > 0, {
      message: "Mailing address is required",
    })
    .refine((val) => val.length >= 10, {
      message: "Mailing address must be at least 10 characters",
    }),
});

export type Step1PersonalInfoInput = z.infer<typeof step1PersonalInfoSchema>;

export const step2MedicalCredentialsSchema = z.object({
  medicalSpecialty: z
    .array(z.string())
    .min(1, { message: "Medical specialty is required" }),
  licenseNumber: z
    .string()
    .transform((val) => val.trim()) // Trim whitespace
    .refine((val) => val.length > 0, {
      message: "License number is required",
    })
    .refine((val) => val.length >= 5, {
      message: "License number must be at least 5 characters",
    })
    .refine((val) => val.length <= 50, {
      message: "License number must be less than 50 characters",
    })
    .refine((val) => !/^\s+$/.test(val), {
      message: "License number cannot contain only spaces",
    })
    .refine((val) => {
      const error = validateLicenseField(val);
      return error === null;
    }, {
      message: "Please enter a valid license number",
    }),
  provinceOfLicensure: z
    .string({ error: "Province of licensure is required" })
    .min(1, { message: "Province of licensure is required" }),
  // licenseExpiryDate: z
  //   .string({ error: "License expiry date is required" })
  //   .min(1, { message: "License expiry date is required" }),
  medicalLicense: z
    .any()
    .refine((val) => val !== null && val !== undefined && val !== "", {
      message: "Medical license document is required",
    })
    .refine(
      (val) => {
        if (!val || val === "") return false;
        // Check if it's a File object
        if (val instanceof File) {
          const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ];
          return allowedTypes.includes(val.type);
        }
        // Check if it's an existing file object with type property
        if (val.type) {
          const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ];
          return allowedTypes.includes(val.type);
        }
        return true; // Allow existing files without type check
      },
      {
        message: "Medical license must be a PDF, DOC, or DOCX file",
      }
    ),
  cvResume: z
    .any()
    .refine((val) => val !== null && val !== undefined && val !== "", {
      message: "CV/Resume document is required",
    })
    .refine(
      (val) => {
        if (!val || val === "") return false;
        // Check if it's a File object
        if (val instanceof File) {
          const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ];
          return allowedTypes.includes(val.type);
        }
        // Check if it's an existing file object with type property
        if (val.type) {
          const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ];
          return allowedTypes.includes(val.type);
        }
        return true; // Allow existing files without type check
      },
      {
        message: "CV/Resume must be a PDF, DOC, or DOCX file",
      }
    ),
});

export type Step2MedicalCredentialsInput = z.infer<
  typeof step2MedicalCredentialsSchema
>;

export const step3IMEExperienceSchema = z.object({
  yearsOfIMEExperience: z
    .string({ error: "Years of IME experience is required" })
    .min(1, { message: "Years of IME experience is required" }),
  provinceOfLicensure: z
    .string({ error: "Province of licensure is required" })
    .min(1, { message: "Province of licensure is required" }),
  languagesSpoken: z
    .array(z.string())
    .min(1, { message: "At least one language is required" }),
  forensicAssessmentTrained: z
    .string({ error: "Forensic assessment training status is required" })
    .min(1, { message: "Forensic assessment training status is required" }),
});

export type Step3IMEExperienceInput = z.infer<typeof step3IMEExperienceSchema>;

export const step4ExperienceDetailsSchema = z.object({
  experienceDetails: z
    .string()
    .max(500, {
      message: "Experience details must be less than 500 characters",
    })
    .optional()
    .default(""),
});

export type Step4ExperienceDetailsInput = z.infer<
  typeof step4ExperienceDetailsSchema
>;

export const step5AvailabilitySchema = z.object({
  preferredRegions: z
    .array(z.string())
    .min(1, { message: "Please select at least one region" }),
  maxTravelDistance: z
    .string()
    .min(1, { message: "Maximum travel distance is required" }),
  // daysAvailable: z.string().min(1, { message: "Days available is required" }),
  // timeWindows: z
  //   .object({
  //     morning: z.boolean(),
  //     afternoon: z.boolean(),
  //     evening: z.boolean(),
  //   })
  //   .refine((value) => value.morning || value.afternoon || value.evening, {
  //     message: "Please select at least one time window",
  //   }),
  acceptVirtualAssessments: z
    .string()
    .min(1, { message: "Please specify if you accept virtual assessments" }),
});

export type Step5AvailabilityInput = z.infer<typeof step5AvailabilitySchema>;

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
  standardIMEFee: z
    .string()
    .min(1, { message: "Standard IME fee is required" })
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      { message: "Please enter a valid fee amount" }
    ),
  virtualIMEFee: z
    .string()
    .min(1, { message: "Virtual IME fee is required" })
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      { message: "Please enter a valid fee amount" }
    ),
  recordReviewFee: z
    .string()
    .min(1, { message: "Record review fee is required" })
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      { message: "Please enter a valid fee amount" }
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
      { message: "Please enter a valid hourly rate" }
    ),
  reportTurnaroundDays: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = parseInt(val);
        return !isNaN(num) && num > 0 && num <= 365;
      },
      { message: "Please enter a valid number of days (1-365)" }
    ),
  cancellationFee: z
    .string()
    .min(1, { message: "Cancellation fee is required" })
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      { message: "Please enter a valid fee amount" }
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
