export const AdditionalCaseStatus = Object.freeze({
  WAITING_TO_BE_SCHEDULED: 'Waiting to be Scheduled',
  REJECTED: 'Rejected',
  INFO_REQUIRED: 'More Information required',
} as const);

export type AdditionalCaseStatus = (typeof AdditionalCaseStatus)[keyof typeof AdditionalCaseStatus];
