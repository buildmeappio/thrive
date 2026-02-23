export const CaseStatus = Object.freeze({
  PENDING: 'Pending',
  READY_TO_APPOINTMENT: 'Ready to Appointment',
  WAITING_TO_BE_SCHEDULED: 'Waiting to be Scheduled',
  REJECTED: 'Rejected',
  INFO_REQUIRED: 'More Information required',
} as const);

export type CaseStatus = (typeof CaseStatus)[keyof typeof CaseStatus];
