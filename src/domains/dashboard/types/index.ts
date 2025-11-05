// Cases Table Types
export type CaseRow = {
  id: string;
  caseNumber: string;
  createdAt: Date | string;
  case: {
    organization?: {
      name: string;
    } | null;
  };
  claimant?: {
    firstName?: string;
    lastName?: string;
  } | null;
};

export type CasesTableProps = {
  items: CaseRow[];
  listHref: string;
  buildDetailHref?: (id: string) => string;
  title?: string;
};

// Appointments Table Types
export type AppointmentRow = {
  id: string;
  caseNumber: string;
  claimant: string;
  date: Date | string;
  time: string;
  location: "In-Person" | "Virtual";
};

export type AppointmentsTableProps = {
  items: AppointmentRow[];
  listHref: string;
  buildDetailHref?: (id: string) => string;
  title?: string;
};

// Reports Table Types
export type ReportRow = {
  id: string;
  caseNumber: string;
  claimant: string;
  dueDate: Date | string;
  assessmentDate: Date | string;
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
export type UpdatesPanelProps = {
  items: string[];
  listHref?: string;
};
