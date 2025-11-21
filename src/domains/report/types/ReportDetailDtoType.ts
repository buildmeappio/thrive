import { Address } from "@prisma/client";

export type ReportDetailDtoType = {
  id: string;
  bookingId: string;
  consentFormSigned: boolean;
  latRuleAcknowledgment: boolean;
  referralQuestionsResponse: string;
  examinerName: string;
  professionalTitle: string;
  dateOfReport: Date;
  signatureType: string | null;
  signatureData: string | null;
  confirmationChecked: boolean;
  googleDocId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  booking: {
    id: string;
    examinationId: string;
    claimantId: string;
    bookingTime: Date;
    examination: {
      id: string;
      caseNumber: string;
      examinationType: {
        id: string;
        name: string;
        shortForm: string | null;
      };
      status: {
        id: string;
        name: string;
      };
    };
    claimant: {
      id: string;
      firstName: string;
      lastName: string;
      emailAddress: string | null;
      phoneNumber: string | null;
      address: Address | null;
    };
  };
  dynamicSections: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
  }>;
  referralDocuments: Array<{
    id: string;
    document: {
      id: string;
      name: string;
      type: string;
      size: number;
      url: string | null;
    };
  }>;
};

