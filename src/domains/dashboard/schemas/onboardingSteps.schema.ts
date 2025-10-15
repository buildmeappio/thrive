import { z } from "zod";

// Schema for profile info
export const profileInfoSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  phoneNumber: z.string().min(1, { message: "Phone number is required" }),
  emailAddress: z.string().email({ message: "Invalid email address" }),
  provinceOfResidence: z.string().min(1, { message: "Province is required" }),
  mailingAddress: z.string().min(1, { message: "Mailing address is required" }),
  profilePhoto: z.string().optional(),
  bio: z.string().optional(),
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

export const availabilityPreferencesSchema = z.object({
  weeklyHours: weeklyHoursSchema,
  overrideHours: overrideHoursSchema.optional(),
  bookingOptions: z
    .object({
      bufferTime: z.string().optional(),
      advanceBooking: z.string().optional(),
    })
    .optional(),
});

export type TimeSlot = z.infer<typeof timeSlotSchema>;
export type WeeklyHours = z.infer<typeof weeklyHoursSchema>;
export type OverrideHours = z.infer<typeof overrideHoursSchema>;
export type AvailabilityPreferencesInput = z.infer<
  typeof availabilityPreferencesSchema
>;
