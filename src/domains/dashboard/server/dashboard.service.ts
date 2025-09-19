// domains/dashboard/service.ts
import prisma from "@/lib/db";
import { endOfMonth, startOfMonth } from "date-fns";
import { CaseRowDTO } from "../types/dashboard.types";
import { toCaseRowDTO } from "./dto/dashboard.dto";

class DashboardService {
    // New organizations "this month"
    async getOrganizationCountThisMonth(): Promise<number> {
        const now = new Date();
        const [from, to] = [startOfMonth(now), endOfMonth(now)];
        return prisma.organization.count({
            where: {
                createdAt: { gte: from, lte: to },
                deletedAt: null,
            },
        });
    }

    // Active cases = not deleted + referral not draft
    async getActiveCaseCount(): Promise<number> {
        return prisma.examination.count({
            where: { deletedAt: null, referral: { isDraft: false } },
        });
    }

    // Recent cases for the dashboard table
    async getRecentCases(limit = 7): Promise<CaseRowDTO[]> {
        const rows = await prisma.examination.findMany({
            where: { deletedAt: null, referral: { isDraft: false } },
            include: {
                status: true,
                referral: {
                    include: {
                        claimant: true,
                        organization: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return rows.map(toCaseRowDTO );
    }
}

const dashboardService = new DashboardService();
export default dashboardService;
