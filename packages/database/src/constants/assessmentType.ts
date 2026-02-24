export const AssessmentType = Object.freeze({
  DISABILITY: 'Disability',
  WSIB: 'WSIB',
  MVA: 'MVA',
  LTD: 'LTD',
  CPP: 'CPP',
} as const);

export type AssessmentTypeType = (typeof AssessmentType)[keyof typeof AssessmentType];
