import { z } from "zod";
import { parsePhoneNumberWithError } from "libphonenumber-js";

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
    .min(2, { message: "First name must be at least 2 characters" })
    .max(50, { message: "First name must be less than 50 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" })
    .max(50, { message: "Last name must be less than 50 characters" }),
  phoneNumber: z
    .string()
    .min(5, { message: "Please enter a valid phone number" })
    .refine(
      (val) => {
        try {
          const phone = parsePhoneNumberWithError(`+1${val}`);
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

  emailAddress: z
    .string()
    .email({ message: "Please enter a valid email address" }),
  provinceOfResidence: z
    .string({ error: "Province of residence is required" })
    .min(1, { message: "Province of residence is required" }),
  mailingAddress: z
    .string()
    .min(10, { message: "Mailing address must be at least 10 characters" }),
});

export type Step1PersonalInfoInput = z.infer<typeof step1PersonalInfoSchema>;

export const step2MedicalCredentialsSchema = z.object({
  medicalSpecialty: z
    .array(z.string())
    .min(1, { message: "Medical specialty is required" }),
  licenseNumber: z
    .string()
    .min(5, { message: "License number must be at least 5 characters" }),
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
    }),
  cvResume: z
    .any()
    .refine((val) => val !== null && val !== undefined && val !== "", {
      message: "CV/Resume document is required",
    }),
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
