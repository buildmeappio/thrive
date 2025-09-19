// src/domains/dashboard/actions/index.ts
"use server";

import { fakeExaminers } from "@/domains/examiner/constants/fakeData";
import dashboardService from "../server/dashboard.service";
import { CaseRowDTO } from "../types/dashboard.types";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";


export async function getOrganizationCount(): Promise<number> {
  return dashboardService.getOrganizationCountThisMonth();
}

export async function getCaseCount(): Promise<number> {
  return dashboardService.getActiveCaseCount();
}

export async function getCases(limit = 7): Promise<CaseRowDTO[]> {
  return dashboardService.getRecentCases(limit);
}

// stubs (you said skip examiner)
export async function getExaminerCount(): Promise<number> {
  return 3;
}
export async function getExaminers(): Promise<ExaminerData[]> {
  return fakeExaminers.slice(0, 3);
}

