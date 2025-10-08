// src/domains/dashboard/actions/index.ts
"use server";

import dashboardService from "../server/dashboard.service";
import { CaseDetailDtoType } from "@/domains/case/types/CaseDetailDtoType";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";
import { 
  listRecentExaminers, 
  getExaminerCount as getExaminerCountAction 
} from "@/domains/examiner/actions";


export async function getOrganizationCount(): Promise<number> {
  return dashboardService.getOrganizationCountThisMonth();
}

export async function getCaseCount(): Promise<number> {
  return dashboardService.getActiveCaseCount();
}

export async function getCases(limit = 3): Promise<CaseDetailDtoType[]> {
  return dashboardService.getRecentCases(limit);
}

// Now calling examiner domain actions
export async function getExaminerCount(): Promise<number> {
  return getExaminerCountAction();
}

export async function getExaminers(): Promise<ExaminerData[]> {
  return listRecentExaminers(3);
}

export async function getWaitingCases(limit = 3): Promise<CaseDetailDtoType[]> {
  return dashboardService.getWaitingCases(limit);
}

