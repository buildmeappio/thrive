import { z } from "zod";
import { validateAddressField } from "@/utils/inputValidation";

// Schema for profile info
export const profileInfoSchema = z.object({
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
  emailAddress: z
    .string()
    .transform((val) => val.trim()) // Trim whitespace
    .refine((val) => val.length > 0, {
      message: "Email address is required",
    })
    .refine((val) => z.string().email().safeParse(val).success, {
      message: "Invalid email address",
    }),
  professionalTitle: z
    .string()
    .transform((val) => val.trim()) // Trim whitespace
    .refine((val) => val.length > 0, {
      message: "Professional title is required",
    }),
  yearsOfExperience: z
    .string()
    .transform((val) => val.trim()) // Trim whitespace
    .refine((val) => val.length > 0, {
      message: "Years of experience is required",
    }),
  clinicName: z
    .string()
    .transform((val) => val.trim()) // Trim whitespace
    .refine((val) => val.length > 0, {
      message: "Clinic name is required",
    })
    .refine((val) => val.length >= 2, {
      message: "Clinic name must be at least 2 characters",
    }),
  clinicAddress: z
    .string()
    .transform((val) => val.trim()) // Trim whitespace
    .refine((val) => val.length > 0, {
      message: "Clinic address is required",
    })
    .refine((val) => val.length >= 10, {
      message: "Clinic address must be at least 10 characters",
    })
    .refine(
      (val) => {
        const error = validateAddressField(val);
        return error === null;
      },
      {
        message: "Please enter a valid clinic address",
      },
    ),
  profilePhoto: z.string().optional(),
  bio: z
    .string()
    .optional()
    .transform((val) => val?.trim() || ""), // Trim whitespace, default to empty string
});

export type ProfileInfoInput = z.infer<typeof profileInfoSchema>;

// Schema for specialty and IME preferences
export const specialtyPreferencesSchema = z.object({
  specialty: z
    .array(z.string())
    .min(1, { message: "Please select at least one specialty" }),
  assessmentTypes: z
    .array(z.string())
    .min(1, { message: "Please select at least one assessment type" }),
  preferredFormat: z
    .string()
    .min(1, { message: "Please select a preferred format" }),
  regionsServed: z
    .array(z.string())
    .min(1, { message: "Please select at least one region" }),
  languagesSpoken: z
    .array(z.string())
    .min(1, { message: "Please select at least one language" }),
});

export type SpecialtyPreferencesInput = z.infer<
  typeof specialtyPreferencesSchema
>;

// Schema for availability preferences
export const timeSlotSchema = z.object({
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
});

export const weeklyHoursSchema = z.object({
  sunday: z.object({
    enabled: z.boolean(),
    timeSlots: z.array(timeSlotSchema),
  }),
  monday: z.object({
    enabled: z.boolean(),
    timeSlots: z.array(timeSlotSchema),
  }),
  tuesday: z.object({
    enabled: z.boolean(),
    timeSlots: z.array(timeSlotSchema),
  }),
  wednesday: z.object({
    enabled: z.boolean(),
    timeSlots: z.array(timeSlotSchema),
  }),
  thursday: z.object({
    enabled: z.boolean(),
    timeSlots: z.array(timeSlotSchema),
  }),
  friday: z.object({
    enabled: z.boolean(),
    timeSlots: z.array(timeSlotSchema),
  }),
  saturday: z.object({
    enabled: z.boolean(),
    timeSlots: z.array(timeSlotSchema),
  }),
});

export const overrideHoursSchema = z.array(
  z.object({
    date: z.string().min(1, { message: "Date is required" }),
    timeSlots: z.array(timeSlotSchema),
  }),
);

export const bookingOptionsSchema = z.object({
  maxIMEsPerWeek: z
    .string()
    .min(1, { message: "Maximum IMEs per week is required" }),
  minimumNotice: z
    .string()
    .min(1, { message: "Minimum notice required is required" }),
});

export const availabilityPreferencesSchema = z.object({
  weeklyHours: weeklyHoursSchema,
  overrideHours: overrideHoursSchema.optional(),
  bookingOptions: bookingOptionsSchema.optional(),
});

export type TimeSlot = z.infer<typeof timeSlotSchema>;
export type WeeklyHours = z.infer<typeof weeklyHoursSchema>;
export type OverrideHours = z.infer<typeof overrideHoursSchema>;
export type AvailabilityPreferencesInput = z.infer<
  typeof availabilityPreferencesSchema
>;

// Schema for payout details
export const payoutDetailsSchema = z
  .object({
    payoutMethod: z.enum(["direct_deposit", "cheque", "interac"]).optional(),
    // Stripe Direct Deposit fields
    legalName: z
      .string()
      .optional()
      .transform((val) => val?.trim() || ""), // Trim whitespace
    sin: z
      .string()
      .optional()
      .transform((val) => val?.trim() || ""), // Trim whitespace
    transitNumber: z
      .string()
      .optional()
      .transform((val) => val?.trim() || ""), // Trim whitespace
    institutionNumber: z
      .string()
      .optional()
      .transform((val) => val?.trim() || ""), // Trim whitespace
    accountNumber: z
      .string()
      .optional()
      .transform((val) => val?.trim() || ""), // Trim whitespace
    // Bank Transfer (Void Cheque) fields
    chequeMailingAddress: z
      .string()
      .optional()
      .transform((val) => val?.trim() || "") // Trim whitespace
      .refine(
        (val) => {
          if (!val) return true; // Optional field
          const error = validateAddressField(val);
          return error === null;
        },
        {
          message: "Please enter a valid cheque mailing address",
        },
      ),
    // Interac E-Transfer fields
    interacEmail: z
      .string()
      .optional()
      .transform((val) => val?.trim() || ""), // Trim whitespace
    autodepositEnabled: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Check if at least one payment method is complete
      const isDirectDepositComplete =
        data.legalName &&
        data.legalName.length > 0 &&
        data.sin &&
        data.sin.length === 9 && // SIN is 9 digits
        data.transitNumber &&
        data.institutionNumber &&
        data.accountNumber &&
        data.transitNumber.length === 5 &&
        data.institutionNumber.length === 3 &&
        data.accountNumber.length >= 7 &&
        data.accountNumber.length <= 12;

      const isChequeComplete =
        data.chequeMailingAddress && data.chequeMailingAddress.length > 0;

      const isInteracComplete =
        data.interacEmail &&
        z.string().email().safeParse(data.interacEmail).success;

      // At least one method must be complete
      if (!isDirectDepositComplete && !isChequeComplete && !isInteracComplete) {
        return false;
      }

      // If any method has partial data, validate that method's requirements
      // Check if direct deposit has any fields filled
      const hasDirectDepositFields =
        data.legalName ||
        data.sin ||
        data.transitNumber ||
        data.institutionNumber ||
        data.accountNumber;

      // If direct deposit fields are filled but incomplete, it's invalid
      if (hasDirectDepositFields && !isDirectDepositComplete) {
        return false;
      }

      // Check if cheque has any fields filled
      const hasChequeFields = data.chequeMailingAddress;

      // If cheque fields are filled but incomplete, it's invalid
      if (hasChequeFields && !isChequeComplete) {
        return false;
      }

      // Check if interac has any fields filled
      const hasInteracFields = data.interacEmail;

      // If interac fields are filled but incomplete, it's invalid
      if (hasInteracFields && !isInteracComplete) {
        return false;
      }

      return true;
    },
    {
      message:
        "Please complete at least one payment method. If you start filling a method, all required fields for that method must be completed.",
    },
  );

export type PayoutDetailsInput = z.infer<typeof payoutDetailsSchema>;

// Schema for services & assessment types
export const servicesAssessmentSchema = z
  .object({
    assessmentTypes: z
      .array(z.string())
      .min(1, { message: "Please select at least one assessment type" }),
    acceptVirtualAssessments: z.boolean(),
    acceptInPersonAssessments: z.boolean(),
    travelToClaimants: z.boolean(),
    travelRadius: z.string().optional(),
    assessmentTypeOther: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        data.travelToClaimants &&
        (!data.travelRadius || data.travelRadius.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Travel radius is required when traveling to claimants",
      path: ["travelRadius"],
    },
  )
  .refine(
    (data) => {
      if (
        data.assessmentTypes.includes("other") &&
        (!data.assessmentTypeOther || data.assessmentTypeOther.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Please specify the other assessment type",
      path: ["assessmentTypeOther"],
    },
  );

export type ServicesAssessmentInput = z.infer<typeof servicesAssessmentSchema>;
