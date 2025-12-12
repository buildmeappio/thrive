import { validateCanadianPhoneNumber } from "@/utils/phoneNumber";
import { z } from "zod";

export const chaperoneFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .trim()
    .refine((val) => val.length > 0 && /^[A-Za-z][A-Za-z\s]*$/.test(val), {
      message:
        "First name must start with a letter and contain only letters and spaces",
    }),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .trim()
    .refine((val) => val.length > 0 && /^[A-Za-z][A-Za-z\s]*$/.test(val), {
      message:
        "Last name must start with a letter and contain only letters and spaces",
    }),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || val === "" || validateCanadianPhoneNumber(val), {
      message: "The phone number is not valid",
    }),
  gender: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),
});

export type ChaperoneFormData = z.infer<typeof chaperoneFormSchema>;
