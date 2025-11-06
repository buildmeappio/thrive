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

    // Recent cases for the dashboard table - filtered by "Pending" status
    async getRecentCases(limit = 7): Promise<CaseDetailDtoType[]> {
        // Get the "Pending" status
        const pendingStatus = await prisma.caseStatus.findFirst({
            where: {
                name: "Pending",
            },
        });

        if (!pendingStatus) {
            return [];
        }

        const rows = await prisma.examination.findMany({
            where: {
                statusId: pendingStatus.id,
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

    // Ready to be Appointment cases for the dashboard table - filtered by "Ready to be Appointment" status
    async getWaitingCases(limit = 3): Promise<CaseDetailDtoType[]> {
        // Get the "Ready to be Appointment" status
        const waitingStatus = await prisma.caseStatus.findFirst({
            where: {
                name: "Ready to be Appointment",
            },
        });

        if (!waitingStatus) {
            return [];
        }

        const rows = await prisma.examination.findMany({
            where: {
                statusId: waitingStatus.id,
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

    // Get count of cases ready to be appointment
    async getWaitingToBeScheduledCount(): Promise<number> {
        const status = await prisma.caseStatus.findFirst({
            where: {
                name: "Ready to be Appointment",
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
