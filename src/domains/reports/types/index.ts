export interface CaseOverviewData {
  requestDateTime: Date;
  dueDate: Date;
  insuranceCoverage: string;
  medicalSpecialty: string;
  claimantFullName: string;
  dateOfBirth: Date;
  gender: string;
  claimantEmail: string;
  claimNumber: string;
  caseId: string;
  caseNumber: string;
  examinerName?: string;
  professionalTitle?: string;
}

export interface DynamicSection {
  id: string;
  title: string;
  content: string;
  documents: UploadedDocument[];
}

export interface UploadedDocument {
  id: string;
  name: string;
  displayName?: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
}

export interface SignatureData {
  type: "canvas" | "upload";
  data: string; // base64 for canvas or URL for upload
}

export interface ReportFormData {
  // Consent & Legal
  consentFormSigned: boolean;
  latRuleAcknowledgment: boolean;

  // Referral Questions
  referralQuestionsResponse: string;
  referralDocuments: UploadedDocument[];

  // Dynamic Sections
  dynamicSections: DynamicSection[];

  // Signature & Submission
  examinerName: string;
  professionalTitle: string;
  dateOfReport: string;
  signature: SignatureData | null;
  confirmationChecked: boolean;
}

export interface PrepareReportPageProps {
  bookingId: string;
  caseData: CaseOverviewData;
  existingReport?: Partial<ReportFormData>;
}

export interface ReportSubmissionData extends ReportFormData {
  bookingId: string;
  caseData: CaseOverviewData;
  googleDocId?: string;
}

// Component Props Interfaces
export interface CaseOverviewSectionProps {
  data: CaseOverviewData;
}

export interface DynamicReportSectionProps {
  id: string;
  title: string;
  content: string;
}

export interface PrepareReportFormProps {
  bookingId: string;
  caseData: CaseOverviewData;
}

export interface ReportActionsProps {
  onSaveDraft: () => Promise<void>;
  onPrint: () => void;
  isSubmitting: boolean;
}

// Server Action Response Types
export interface GetReportResponse {
  success: boolean;
  data?: ReportFormData;
  message?: string;
}

export interface SaveReportDraftInput {
  bookingId: string;
  reportData: ReportFormData;
}

export interface SaveReportDraftResponse {
  success: boolean;
  message?: string;
}

export interface SubmitReportInput {
  bookingId: string;
  reportData: ReportFormData;
}

export interface SubmitReportResponse {
  success: boolean;
  message?: string;
  googleDocId?: string;
  htmlContent?: string;
}