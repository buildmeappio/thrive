import examinerService from "../examiner.service";

export async function getExaminerCount(): Promise<number> {
  return examinerService.getExaminerCountThisMonth(["PENDING", "SUBMITTED"]);
}
