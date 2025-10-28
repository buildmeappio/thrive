import { validateCanadianPhoneNumber } from "@/utils/phoneNumber";
import { z } from "zod";

export const chaperoneFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .trim(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .refine((val) => val === "" || validateCanadianPhoneNumber(val), {
      message: "The phone number is not valid",
    })
    .optional(),
  gender: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),
});

export type ChaperoneFormData = z.infer<typeof chaperoneFormSchema>;
