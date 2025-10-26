export type CaseDetailsData = {
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

  caseType: {
    id: string;
    name: string;
  } | null;
  examinations: {
    id: string;
    caseNumber: string;
    dueDate: Date | null;
    notes: string | null;
    additionalNotes: string | null;
    urgencyLevel: 'HIGH' | 'MEDIUM' | 'LOW' | null;
    preference: string | null;
    supportPerson: boolean;
    examinationType: {
      id: string;
      name: string;
    };
    status: {
      id: string;
      name: string;
    };
    legalRepresentative: {
      id: string;
      companyName: string | null;
      contactPersonName: string | null;
      phoneNumber: string | null;
      faxNumber: string | null;
      address: {
        id: string;
        address: string;
        street: string | null;
        city: string | null;
        province: string | null;
        postalCode: string | null;
        suite: string | null;
      } | null;
    } | null;
    insurance: {
      id: string;
      companyName: string;
      emailAddress: string;
      contactPersonName: string;
      policyNumber: string;
      claimNumber: string;
      dateOfLoss: Date;
      policyHolderIsClaimant: boolean;
      policyHolderFirstName: string;
      policyHolderLastName: string;
      phoneNumber: string;
      faxNumber: string;
      address: {
        id: string;
        address: string;
        street: string | null;
        city: string | null;
        province: string | null;
        postalCode: string | null;
        suite: string | null;
      } | null;
    } | null;
    claimant: {
      id: string;
      firstName: string;
      lastName: string;
      dateOfBirth: Date | null;
      gender: string | null;
      phoneNumber: string | null;
      emailAddress: string | null;
      relatedCasesDetails: string | null;
      familyDoctorName: string | null;
      familyDoctorEmailAddress: string | null;
      familyDoctorPhoneNumber: string | null;
      familyDoctorFaxNumber: string | null;
      address: {
        id: string;
        address: string;
        street: string | null;
        city: string | null;
        province: string | null;
        postalCode: string | null;
        suite: string | null;
      };
    };
  }[];
};
