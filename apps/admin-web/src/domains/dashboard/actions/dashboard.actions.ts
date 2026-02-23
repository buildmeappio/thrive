"use server";

import * as dashboardService from "../server/dashboard.service";
import { CaseDetailDtoType } from "@/domains/case/types/CaseDetailDtoType";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";
import {
  getExaminerCount as getExaminerCountAction,
  listRecentApplications,
} from "@/domains/examiner/actions";

export async function getOrganizationCount(): Promise<number> {
  return dashboardService.getOrganizationCountThisMonth();
}

export async function getCaseCount(): Promise<number> {
  return dashboardService.getActiveCaseCount();
}

export async function getCases(limit: number): Promise<CaseDetailDtoType[]> {
  return dashboardService.getRecentCases(limit);
}

// Now calling examiner domain actions
export async function getExaminerCount(): Promise<number> {
  return getExaminerCountAction();
}

export async function getExaminers(limit: number): Promise<ExaminerData[]> {
  // Dashboard should show applications, not examiners
  return listRecentApplications(limit);
}

export async function getWaitingCases(
  limit: number,
): Promise<CaseDetailDtoType[]> {
  return dashboardService.getWaitingCases(limit);
}

export async function getWaitingToBeScheduledCount(): Promise<number> {
  return dashboardService.getWaitingToBeScheduledCount();
}

export async function getDueCasesCount(
  period: "today" | "tomorrow" | "this-week" = "today",
): Promise<number> {
  return dashboardService.getDueCasesCount(period);
}
