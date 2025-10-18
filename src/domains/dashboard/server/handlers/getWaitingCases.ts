"use server";

import dashboardService from "../dashboard.service";
import { CaseDetailDtoType } from "@/domains/case/types/CaseDetailDtoType";

export async function getWaitingCasesHandler(limit = 3): Promise<CaseDetailDtoType[]> {
    return await dashboardService.getWaitingCases(limit);
}

