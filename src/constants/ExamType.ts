export const ExamType = Object.freeze({
  ORTHOPEDIC: "Orthopedic",
  GENERAL_MEDICINE: "General Medicine",
  PSYCHOLOGICAL: "Psychological",
  PSYCHIATRY: "Psychiatry",
  NEUROLOGICAL: "Neurological",
  PEDIATRIC_MEDICINE: "Pediatric Medicine",
  GERIATRIC_MEDICINE: "Geriatric Medicine",
  CARDIOLOGY: "Cardiology",
  OTHER: "Other",
} as const);

export type ExamTypeType =
  (typeof ExamType)[keyof typeof ExamType];
