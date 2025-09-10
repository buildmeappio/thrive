export const CaseStatus = Object.freeze({
  PENDING: "Pending",
  READY_TO_APPOINTMENT: "Ready to Appointment",
} as const);

export type CaseStatus = (typeof CaseStatus)[keyof typeof CaseStatus];
