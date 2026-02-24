export const ExaminationType = Object.freeze({
  ORTHOPEDIC: 'Orthopedic',
  GENERAL_MEDICINE: 'General Medicine',
  PSYCHOLOGICAL: 'Psychological',
  PSYCHIATRY: 'Psychiatry',
  NEUROLOGICAL: 'Neurological',
  PEDIATRIC_MEDICINE: 'Pediatric Medicine',
  GERIATRIC_MEDICINE: 'Geriatric Medicine',
  CARDIOLOGY: 'Cardiology',
  OTHER: 'Other',
} as const);

export type ExaminationTypeType = (typeof ExaminationType)[keyof typeof ExaminationType];
