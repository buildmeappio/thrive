export const Departments = Object.freeze({
  CLAIMS: 'claims',
  LEGAL: 'legal',
  HUMAN_RESOURCES: 'human_resources',
  MEDICAL_OR_CLINICAL: 'medical_or_clinical',
  CASE_MANAGEMENT: 'case_management',
  ADMINISTRATION: 'administration',
  COMPLIANCE_OR_RISK: 'compliance_or_risk',
  FINANCE_OR_BILLING: 'finance_or_billing',
} as const);

export type RoleType = (typeof Departments)[keyof typeof Departments];
