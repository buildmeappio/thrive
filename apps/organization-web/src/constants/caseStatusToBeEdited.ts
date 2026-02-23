export const CaseStatusToBeEdited = Object.freeze({
  PENDING: 'Pending',
  INFO_REQUIRED: 'More Information required',
} as const);

export type CaseStatusToBeEdited = (typeof CaseStatusToBeEdited)[keyof typeof CaseStatusToBeEdited];
