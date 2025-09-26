export type Case = {
  id: string;
  organizationId: string | null;
  claimantId: string;
  insuranceId: string | null;
  legalRepresentativeId: string | null;
  caseTypeId: string | null;
  reason: string | null;
  consentForSubmission: boolean;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  claimant: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date | null;
    gender: string | null;
    phoneNumber: string | null;
    emailAddress: string | null;
  };
  insurance: {
    id: string;
    companyName: string;
    emailAddress: string;
    contactPersonName: string;
    policyNumber: string;
    claimNumber: string;
    dateOfLoss: Date;
  } | null;
  legalRepresentative: {
    id: string;
    companyName: string | null;
    contactPersonName: string | null;
  } | null;
  caseType: {
    id: string;
    name: string;
  } | null;
  examinations: {
    id: string;
    caseNumber: string;
    examinationType: {
      id: string;
      name: string;
    };
    status: {
      id: string;
      name: string;
    };
    dueDate: Date | null;
    urgencyLevel: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  }[];
};
