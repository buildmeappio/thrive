// Cases Table Types (Case Offers Pending Review)
export type CaseRow = {
  id: string;
  caseNumber: string;
  claimant: string;
  claimType: string;
  appointment: Date | string;
  dueDate: Date | string;
};

export type CasesTableProps = {
  items: CaseRow[];
  listHref: string;
  buildDetailHref?: (id: string) => string;
  title?: string;
};

// Appointments Table Types (Upcoming Appointments)
export type AppointmentRow = {
  id: string;
  caseNumber: string;
  claimant: string;
  claimType: string;
  appointment: Date | string;
  dueDate: Date | string;
};

export type AppointmentsTableProps = {
  items: AppointmentRow[];
  listHref: string;
  buildDetailHref?: (id: string) => string;
  title?: string;
};

// Reports Table Types (Waiting to be Submitted)
export type ReportRow = {
  id: string;
  claimant: string;
  company: string;
  dueDate: Date | string;
  reason: string;
  status: "Pending" | "Overdue";
};

export type ReportsTableProps = {
  items: ReportRow[];
  listHref: string;
  buildDetailHref?: (id: string) => string;
  title?: string;
};

// Summary Panel Types
export type SummaryPanelProps = {
  earnings: string;
  invoiced: string;
  totalIMEs: number;
  period?: string;
  dropdownOptions?: string[];
  onPeriodChange?: (value: string) => void;
};

// Updates Panel Types
export type UpdateType =
  | "APPOINTMENT_SCHEDULED"
  | "APPOINTMENT_ACCEPTED"
  | "APPOINTMENT_DECLINED"
  | "REPORT_SUBMITTED"
  | "REPORT_OVERDUE"
  | "REPORT_DRAFT_CREATED";

export type RecentUpdate = {
  id: string;
  type: UpdateType;
  message: string;
  caseNumber: string;
  timestamp: Date;
  bookingId?: string;
  reportId?: string;
};

export type UpdatesPanelProps = {
  items: RecentUpdate[];
  listHref?: string;
};

// Recent Updates Server Types
export type GetRecentUpdatesInput = {
  examinerProfileId: string;
  limit?: number;
};

export type GetRecentUpdatesResponse = {
  success: boolean;
  data?: RecentUpdate[];
  message?: string;
};

// Case Details Types
export type CaseDetailsProps = {
  data: CaseDetailsData;
  examinerProfileId: string;
};

// Dashboard Server Types

export type GetDashboardBookingsInput = {
  examinerProfileId: string;
};

export type DashboardBookingData = {
  id: string;
  caseNumber: string;
  claimant: string;
  claimType: string;
  appointment: Date;
  dueDate: Date;
};

export type GetDashboardBookingsResponse = {
  success: boolean;
  data?: {
    pendingReview: DashboardBookingData[];
    upcomingAppointments: DashboardBookingData[];
  };
  message?: string;
};

// Case Details Types
export type GetCaseDetailsInput = {
  bookingId: string;
  examinerProfileId: string;
};

export type CaseDetailsData = {
  bookingId: string;
  caseNumber: string;
  status:
    | "PENDING"
    | "ACCEPT"
    | "DECLINE"
    | "REQUEST_MORE_INFO"
    | "DISCARDED"
    | null;
  reportStatus:
    | "PENDING"
    | "DRAFT"
    | "SUBMITTED"
    | "REVIEWED"
    | "APPROVED"
    | "REJECTED"
    | null;
  claimant: {
    firstName: string;
    lastName: string;
    claimType: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    phoneNumber: string | null;
    emailAddress: string | null;
    address: {
      address: string;
      street: string | null;
      city: string | null;
      province: string | null;
      postalCode: string | null;
      suite: string | null;
    } | null;
    familyDoctorName: string | null;
    familyDoctorEmailAddress: string | null;
    familyDoctorPhoneNumber: string | null;
    relatedCasesDetails: string | null;
  };
  insurance: {
    companyName: string;
    contactPersonName: string;
    emailAddress: string;
    phoneNumber: string;
    faxNumber: string;
    policyNumber: string;
    claimNumber: string;
    dateOfLoss: Date;
    policyHolderFirstName: string;
    policyHolderLastName: string;
    address: {
      address: string;
      street: string | null;
      city: string | null;
      province: string | null;
      postalCode: string | null;
      suite: string | null;
    } | null;
  } | null;
  legalRepresentative: {
    companyName: string | null;
    contactPersonName: string | null;
    phoneNumber: string | null;
    faxNumber: string | null;
    address: {
      address: string;
      street: string | null;
      city: string | null;
      province: string | null;
      postalCode: string | null;
      suite: string | null;
    } | null;
  } | null;
  examination: {
    examinationType: string;
    dueDate: Date | null;
    urgencyLevel: "HIGH" | "MEDIUM" | "LOW" | null;
    preference: "IN_PERSON" | "VIRTUAL" | "EITHER";
    notes: string | null;
    additionalNotes: string | null;
    benefits: string[];
  };
  documents: {
    id: string;
    name: string;
    displayName: string | null;
    type: string;
    size: number;
  }[];
};

export type GetCaseDetailsResponse = {
  success: boolean;
  data?: CaseDetailsData;
  message?: string;
};

// Case Action Types
export type UpdateBookingStatusInput = {
  bookingId: string;
  examinerProfileId: string;
  status: "ACCEPT" | "DECLINE" | "REQUEST_MORE_INFO" | "DISCARDED";
  message?: string;
};

export type UpdateBookingStatusResponse = {
  success: boolean;
  message?: string;
};

// Cases List Types
export type GetAllCasesInput = {
  examinerProfileId: string;
};

export type CaseRowData = {
  id: string;
  caseNumber: string;
  claimant: string;
  company: string;
  benefits: string;
  appointment: Date | null;
  dueDate: Date | null;
  status:
    | "PENDING"
    | "ACCEPT"
    | "DECLINE"
    | "REQUEST_MORE_INFO"
    | "DISCARDED"
    | "REPORT_SUBMITTED"
    | null;
  reportStatus:
    | "PENDING"
    | "DRAFT"
    | "SUBMITTED"
    | "REVIEWED"
    | "APPROVED"
    | "REJECTED"
    | null;
};

export type GetAllCasesResponse = {
  success: boolean;
  data?: CaseRowData[];
  message?: string;
};
