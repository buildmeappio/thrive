export const CaseType = Object.freeze({
  MOTOR_VEHICLE_ACCIDENT: 'Motor Vehicle Accident',
  WORKPLACE_INJURY: 'Workplace Injury',
  SLIP_AND_FALL: 'Slip and Fall',
  PRODUCT_LIABILITY: 'Product Liability',
  MEDICAL_MALPRACTICE: 'Medical Malpractice',
  DISABILITY_CLAIM: 'Disability Claim',
  WORKERS_COMPENSATION: 'Workers Compensation',
  PERSONAL_INJURY: 'Personal Injury',
  INSURANCE_CLAIM: 'Insurance Claim',
  REHABILITATION_ASSESSMENT: 'Rehabilitation Assessment',
} as const);

export type CaseType = (typeof CaseType)[keyof typeof CaseType];
