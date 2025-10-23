// domains/dashboard/service.ts
import prisma from "@/lib/db";
import { endOfMonth, startOfMonth, startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from "date-fns";
import { CaseDetailDtoType } from "@/domains/case/types/CaseDetailDtoType";
import { CaseDto } from "@/domains/case/server/dto/case.dto";

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
        return await prisma.examination.count({
            where: {
                case: {
                    deletedAt: null,
                    isDraft: false,
                },
            },
        });
    }

    // Recent cases for the dashboard table
    async getRecentCases(limit = 7): Promise<CaseDetailDtoType[]> {
        const rows = await prisma.examination.findMany({
            where: {
                case: {
                    deletedAt: null,
                    isDraft: false,
                },
            },
            include: {
                examiner: { include: { user: true } },
                examinationType: true,
                status: true,
                claimant: { include: { address: true } },
                legalRepresentative: { include: { address: true } },
                insurance: { include: { address: true } },
                services: {
                    include: {
                        interpreter: { include: { language: true } },
                        transport: { include: { pickupAddress: true } },
                    },
                },
                case: {
                    include: {
                        caseType: true,
                        documents: { include: { document: true } },
                        organization: {
                            include: {
                                manager: {
                                    include: {
                                        account: {
                                            include: {
                                                user: true
                                            }
                                        }
                                    }
                                }
                            }
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return CaseDto.toCaseDto(rows);

    }

    // Waiting to be scheduled cases for the dashboard table
    async getWaitingCases(limit = 3): Promise<CaseDetailDtoType[]> {
        // Get the relevant statuses: Pending, Waiting to be Scheduled, Scheduled
        const statuses = await prisma.caseStatus.findMany({
            where: {
                name: {
                    in: ["Pending", "Waiting to be Scheduled", "Scheduled"],
                },
            },
        });

        if (statuses.length === 0) {
            return [];
        }

        const statusIds = statuses.map(s => s.id);

        const rows = await prisma.examination.findMany({
            where: {
                statusId: {
                    in: statusIds,
                },
                case: {
                    deletedAt: null,
                    isDraft: false,
                },
            },
            include: {
                examiner: { include: { user: true } },
                examinationType: true,
                status: true,
                claimant: { include: { address: true } },
                legalRepresentative: { include: { address: true } },
                insurance: { include: { address: true } },
                services: {
                    include: {
                        interpreter: { include: { language: true } },
                        transport: { include: { pickupAddress: true } },
                    },
                },
                case: {
                    include: {
                        caseType: true,
                        documents: { include: { document: true } },
                        organization: {
                            include: {
                                manager: {
                                    include: {
                                        account: {
                                            include: {
                                                user: true
                                            }
                                        }
                                    }
                                }
                            }
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return CaseDto.toCaseDto(rows);
    }

    // Get count of cases waiting to be scheduled
    async getWaitingToBeScheduledCount(): Promise<number> {
        const status = await prisma.caseStatus.findFirst({
            where: {
                name: "Waiting to be Scheduled",
            },
        });

        if (!status) {
            return 0;
        }

        return await prisma.examination.count({
            where: {
                statusId: status.id,
                case: {
                    deletedAt: null,
                    isDraft: false,
                },
            },
        });
    }

    // Get count of cases due by period (today, tomorrow, this week)
    async getDueCasesCount(period: "today" | "tomorrow" | "this-week"): Promise<number> {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (period) {
            case "today":
                startDate = startOfDay(now);
                endDate = endOfDay(now);
                break;
            case "tomorrow":
                const tomorrow = addDays(now, 1);
                startDate = startOfDay(tomorrow);
                endDate = endOfDay(tomorrow);
                break;
            case "this-week":
                startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
                endDate = endOfWeek(now, { weekStartsOn: 1 });
                break;
            default:
                startDate = startOfDay(now);
                endDate = endOfDay(now);
        }

        return await prisma.examination.count({
            where: {
                dueDate: {
                    gte: startDate,
                    lte: endDate,
                },
                case: {
                    deletedAt: null,
                    isDraft: false,
                },
            },
        });
    }
}

const dashboardService = new DashboardService();
export default dashboardService;
