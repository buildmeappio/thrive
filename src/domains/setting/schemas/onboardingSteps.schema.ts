import { z } from "zod";

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
    }),
  phoneNumber: z
    .string()
    .transform((val) => val.trim()) // Trim whitespace
    .refine((val) => val.length > 0, {
      message: "Phone number is required",
    }),
  landlineNumber: z
    .string()
    .optional()
    .transform((val) => val?.trim() || ""), // Trim whitespace, default to empty string
  emailAddress: z
    .string()
    .transform((val) => val.trim()) // Trim whitespace
    .refine((val) => val.length > 0, {
      message: "Email address is required",
    })
    .refine((val) => z.string().email().safeParse(val).success, {
      message: "Invalid email address",
    }),
  provinceOfResidence: z
    .string()
    .transform((val) => val.trim()) // Trim whitespace
    .refine((val) => val.length > 0, {
      message: "Province is required",
    }),
  mailingAddress: z
    .string()
    .transform((val) => val.trim()) // Trim whitespace
    .refine((val) => val.length > 0, {
      message: "Mailing address is required",
    })
    .refine((val) => val.length >= 10, {
      message: "Mailing address must be at least 10 characters",
    }),
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
  })
);

export const bookingOptionsSchema = z.object({
  appointmentTypes: z.array(z.enum(["phone", "video"])).min(1, {
    message: "At least one appointment type is required",
  }),
  appointmentDuration: z
    .string()
    .min(1, { message: "Appointment duration is required" }),
  buffer: z.string().min(1, { message: "Buffer time is required" }),
  bookingWindow: z
    .number()
    .min(1, { message: "Booking window must be at least 1 day" }),
  minimumNotice: z.object({
    value: z.number().min(1, { message: "Minimum notice value is required" }),
    unit: z.enum(["hours", "days"]),
  }),
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
    payoutMethod: z.enum(["direct_deposit", "cheque", "interac"], {
      message: "Please select a payout method",
    }),
    // Direct Deposit fields
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
    // Cheque fields
    chequeMailingAddress: z
      .string()
      .optional()
      .transform((val) => val?.trim() || ""), // Trim whitespace
    // Interac E-Transfer fields
    interacEmail: z
      .string()
      .optional()
      .transform((val) => val?.trim() || ""), // Trim whitespace
  })
  .refine(
    (data) => {
      if (data.payoutMethod === "direct_deposit") {
        return (
          data.transitNumber &&
          data.institutionNumber &&
          data.accountNumber &&
          data.transitNumber.length === 5 &&
          data.institutionNumber.length === 3 &&
          data.accountNumber.length >= 7 &&
          data.accountNumber.length <= 12
        );
      }
      if (data.payoutMethod === "cheque") {
        return (
          data.chequeMailingAddress && data.chequeMailingAddress.length > 0
        );
      }
      if (data.payoutMethod === "interac") {
        return (
          data.interacEmail &&
          z.string().email().safeParse(data.interacEmail).success
        );
      }
      return true;
    },
    {
      message:
        "Please fill in all required fields for the selected payout method",
    }
  );

export type PayoutDetailsInput = z.infer<typeof payoutDetailsSchema>;
