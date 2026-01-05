import type { ExaminerData } from "../types/ExaminerData";
import type { ExaminerStatus } from "../types/examinerDetail.types";

export const mapStatus = {
  DRAFT: "draft",
  PENDING: "pending",
  ACCEPTED: "approved",
  REJECTED: "rejected",
  INFO_REQUESTED: "info_requested",
  ACTIVE: "active",
  SUBMITTED: "submitted",
  IN_REVIEW: "in_review",
  MORE_INFO_REQUESTED: "more_info_requested",
  INTERVIEW_REQUESTED: "interview_requested",
  INTERVIEW_SCHEDULED: "interview_scheduled",
  INTERVIEW_COMPLETED: "interview_completed",
  CONTRACT_SENT: "contract_sent",
  CONTRACT_SIGNED: "contract_signed",
  APPROVED: "approved",
  WITHDRAWN: "withdrawn",
  SUSPENDED: "suspended",
} as const;

export const getMappedStatus = (
  status: ExaminerData["status"],
): ExaminerStatus => {
  return mapStatus[status] as ExaminerStatus;
};
