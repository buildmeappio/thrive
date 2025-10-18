export type CountDTO = {
  organizationsThisMonth: number;
  activeCases: number;
};

export type CaseRowDTO = {
  id: string;
  caseNo: string;
  claimant: string;
  organization: string;
  urgency: "Urgent" | "Normal";
  status: "Pending" | "Accepted" | "Rejected";
};
