"use server";

export default async function listExaminerStatuses(): Promise<string[]> {
  return [
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "INFO_REQUESTED",
    "ACTIVE",
    "SUBMITTED",
    "IN_REVIEW",
    "MORE_INFO_REQUESTED",
    "INTERVIEW_SCHEDULED",
    "INTERVIEW_COMPLETED",
    "CONTRACT_SENT",
    "CONTRACT_SIGNED",
    "APPROVED",
    "WITHDRAWN",
  ];
}
