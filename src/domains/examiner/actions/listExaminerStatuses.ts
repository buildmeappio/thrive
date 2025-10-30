"use server";

export default async function listExaminerStatuses(): Promise<string[]> {
  return ["PENDING", "ACCEPTED", "REJECTED", "INFO_REQUESTED"];
}
