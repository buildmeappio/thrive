export const OrganizationTypes = Object.freeze({
  INSURANCE_COMPANY: 'insurance_company',
  LAW_FIRM: 'law_firm',
  EMPLOYER: 'employer',
  GOVERNMENT_AGENCY: 'government_agency',
  THIRD_PARTY_ADMINISTRATOR: 'third_party_administrator',
  REHABILITATION_CENTER: 'rehabilitation_center',
  UNION_OR_LABOUR_ORGANIZATION: 'union_or_labour_organization',
  INDIVIDUAL: 'individual',
  IME_VENDOR_OR_SERVICE_PROVIDER: 'ime_vendor_or_service_provider',
} as const);

export type OrganizationTypes = (typeof OrganizationTypes)[keyof typeof OrganizationTypes];
