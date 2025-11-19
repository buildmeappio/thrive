import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const uploadedDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number().max(MAX_FILE_SIZE, "File size must be less than 10MB"),
  type: z
    .string()
    .refine(
      (type) => ACCEPTED_FILE_TYPES.includes(type),
      "Only PDF, DOC, and DOCX files are allowed"
    ),
  url: z.string().optional(),
  file: z.any().optional(),
});

export const dynamicSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Section title is required"),
  content: z.string().min(1, "Section content is required"),
});

export const signatureDataSchema = z.object({
  type: z.enum(["canvas", "upload"]),
  data: z.string().min(1, "Signature is required"),
});

export const reportFormSchema = z.object({
  // Consent & Legal
  consentFormSigned: z.boolean().refine((val) => val === true, {
    message: "Consent form must be signed",
  }),
  latRuleAcknowledgment: z.boolean().refine((val) => val === true, {
    message: "LAT Rule 10.2 must be acknowledged",
  }),

  // Referral Questions
  referralQuestionsResponse: z
    .string()
    .min(1, "Referral questions response is required")
    .max(500, "Response must not exceed 500 characters"),
  referralDocuments: z.array(uploadedDocumentSchema),

  // Dynamic Sections
  dynamicSections: z.array(dynamicSectionSchema),

  // Signature & Submission
  examinerName: z.string().min(1, "Examiner name is required"),
  professionalTitle: z.string().min(1, "Professional title is required"),
  dateOfReport: z.string().min(1, "Date of report is required"),
  signature: signatureDataSchema.nullable().refine((val) => val !== null, {
    message: "Signature is required",
  }),
  confirmationChecked: z.boolean().refine((val) => val === true, {
    message: "You must confirm the report accuracy",
  }),
});

export type ReportFormValues = z.infer<typeof reportFormSchema>;
