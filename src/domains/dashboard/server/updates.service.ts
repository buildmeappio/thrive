"use server";
import prisma from "@/lib/db";
import {
  DashboardUpdate,
  UpdatesFilters,
  UpdatesResponse,
} from "../types/updates.types";
import { formatFullName } from "@/utils/text";
import {
  startOfDay,
  endOfDay,
  subDays,
} from "date-fns";

class UpdatesService {
  // Get recent updates for dashboard panel (limited to 9)
  // Only shows updates from the last 30 days
  async getRecentUpdates(limit = 9): Promise<DashboardUpdate[]> {
    try {
      const now = new Date();
      const thirtyDaysAgo = subDays(now, 30);

      // Get all updates from last 30 days, then limit
      const allUpdates = await this.getAllUpdates(thirtyDaysAgo);

      // Sort by date and limit
      return allUpdates.slice(0, limit);
    } catch (error) {
      console.error("Error fetching recent updates:", error);
      return [];
    }
  }

  // Helper method to fetch all updates (with optional date restriction)
  private async getAllUpdates(
    dateRestriction?: Date,
  ): Promise<DashboardUpdate[]> {
    const updates: DashboardUpdate[] = [];
    const dateFilter = dateRestriction ? { gte: dateRestriction } : undefined;

    try {
      // 1. Examiner applications approved (verified)
      const approvedApplications = await prisma.examinerApplication.findMany({
        where: {
          status: "APPROVED",
          approvedAt: dateFilter ? { not: null, ...dateFilter } : { not: null },
          deletedAt: null,
        },
        orderBy: { approvedAt: "desc" },
        take: 100, // Get more for filtering
      });

      for (const application of approvedApplications) {
        const name =
          application.firstName && application.lastName
            ? formatFullName(application.firstName, application.lastName)
            : application.email || "Examiner";
        updates.push({
          id: `examiner-verified-${application.id}`,
          type: "examiner",
          title: `${name.split(" ").pop()}'s profile was verified`,
          entityId: application.id,
          entityType: "examinerApplication",
          createdAt: application.approvedAt!,
        });
      }

      // 2. Organizations approved/onboarded
      const approvedOrgs = await prisma.organization.findMany({
        where: {
          status: "ACCEPTED",
          approvedAt: dateFilter ? { not: null, ...dateFilter } : { not: null },
          deletedAt: null,
        },
        orderBy: { approvedAt: "desc" },
        take: 100,
      });

      for (const org of approvedOrgs) {
        updates.push({
          id: `org-approved-${org.id}`,
          type: "organization",
          title: `New insurer onboarded: ${org.name}`,
          entityId: org.id,
          entityType: "organization",
          createdAt: org.approvedAt!,
        });
      }

      // 3. Cases status changes (recently reviewed)
      const reviewedStatus = await prisma.caseStatus.findFirst({
        where: {
          name: { contains: "Ready", mode: "insensitive" },
        },
      });

      if (reviewedStatus) {
        const reviewedCases = await prisma.examination.findMany({
          where: {
            statusId: reviewedStatus.id,
            approvedAt: dateFilter
              ? { not: null, ...dateFilter }
              : { not: null },
            case: { deletedAt: null, isDraft: false },
          },
          include: {
            case: {
              include: {
                organization: true,
              },
            },
          },
          orderBy: { approvedAt: "desc" },
          take: 100,
        });

        for (const exam of reviewedCases) {
          const caseNumber = exam.caseNumber || exam.id.slice(0, 8);
          updates.push({
            id: `case-reviewed-${caseNumber}`,
            type: "case",
            title: `Case ${caseNumber} status changed to: Reviewed`,
            description: exam.case?.organization?.name
              ? `From ${exam.case.organization.name}`
              : undefined,
            entityId: exam.id,
            entityType: "examination",
            createdAt: exam.approvedAt!,
          });
        }
      }

      // 4. Interview completed
      const interviewCompleted = await prisma.examinerApplication.findMany({
        where: {
          status: "INTERVIEW_COMPLETED",
          updatedAt: dateFilter || undefined,
          deletedAt: null,
        },
        include: {
          address: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 100,
      });

      for (const app of interviewCompleted) {
        const name =
          app.firstName && app.lastName
            ? formatFullName(app.firstName, app.lastName)
            : app.email || "Examiner";
        updates.push({
          id: `interview-completed-${app.id}`,
          type: "interview",
          title: `Interview completed for: ${name}`,
          entityId: app.id,
          entityType: "examinerApplication",
          createdAt: app.updatedAt,
        });
      }

      // 5. Contract signed
      const contractSigned = await prisma.examinerProfile.findMany({
        where: {
          status: "CONTRACT_SIGNED",
          updatedAt: dateFilter || undefined,
          deletedAt: null,
        },
        include: {
          account: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 100,
      });

      for (const profile of contractSigned) {
        const user = profile.account?.user;
        const name = user
          ? formatFullName(user.firstName, user.lastName)
          : profile.professionalTitle || "Examiner";
        updates.push({
          id: `contract-signed-${profile.id}`,
          type: "examiner",
          title: `Contract signed by: ${name}`,
          entityId: profile.id,
          entityType: "examinerProfile",
          createdAt: profile.updatedAt,
        });
      }

      // 6. New interpreters added
      const newInterpreters = await prisma.interpreter.findMany({
        where: {
          createdAt: dateFilter || undefined,
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      for (const interpreter of newInterpreters) {
        updates.push({
          id: `interpreter-added-${interpreter.id}`,
          type: "service",
          title: `New interpreter added: ${interpreter.companyName}`,
          entityId: interpreter.id,
          entityType: "interpreter",
          createdAt: interpreter.createdAt,
        });
      }

      // 7. New transporters added
      const newTransporters = await prisma.transporter.findMany({
        where: {
          createdAt: dateFilter || undefined,
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      for (const transporter of newTransporters) {
        updates.push({
          id: `transporter-added-${transporter.id}`,
          type: "service",
          title: `New transporter added: ${transporter.companyName}`,
          entityId: transporter.id,
          entityType: "transporter",
          createdAt: transporter.createdAt,
        });
      }

      // 8. New chaperones added
      const newChaperones = await prisma.chaperone.findMany({
        where: {
          createdAt: dateFilter || undefined,
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      for (const chaperone of newChaperones) {
        const name = formatFullName(chaperone.firstName, chaperone.lastName);
        updates.push({
          id: `chaperone-added-${chaperone.id}`,
          type: "service",
          title: `New chaperone added: ${name}`,
          entityId: chaperone.id,
          entityType: "chaperone",
          createdAt: chaperone.createdAt,
        });
      }

      // Sort by date
      updates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return updates;
    } catch (error) {
      console.error("Error fetching all updates:", error);
      return [];
    }
  }

  // Get updates with pagination and filters
  async getUpdates(filters: UpdatesFilters = {}): Promise<UpdatesResponse> {
    const { type, dateRange, page = 1, pageSize = 20 } = filters;

    const skip = (page - 1) * pageSize;

    try {
      // Determine date restriction based on dateRange filter
      let dateRestriction: Date | undefined;
      const now = new Date();

      if (dateRange && dateRange !== "all") {
        switch (dateRange) {
          case "today":
            dateRestriction = startOfDay(now);
            break;
          case "yesterday":
            dateRestriction = startOfDay(subDays(now, 1));
            break;
          case "last7days":
            dateRestriction = startOfDay(subDays(now, 7));
            break;
          case "last30days":
            dateRestriction = startOfDay(subDays(now, 30));
            break;
        }
      }

      // Get all updates (with optional date restriction)
      let allUpdates = await this.getAllUpdates(dateRestriction);

      // Apply date filter for precise range (if needed)
      if (dateRange === "yesterday") {
        const yesterdayStart = startOfDay(subDays(now, 1));
        const yesterdayEnd = endOfDay(subDays(now, 1));
        allUpdates = allUpdates.filter((u) => {
          const updateDate = u.createdAt;
          return updateDate >= yesterdayStart && updateDate <= yesterdayEnd;
        });
      } else if (dateRange === "today") {
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        allUpdates = allUpdates.filter((u) => {
          const updateDate = u.createdAt;
          return updateDate >= todayStart && updateDate <= todayEnd;
        });
      }

      // Apply type filter
      if (type && type !== "all") {
        allUpdates = allUpdates.filter((u) => u.type === type);
      }

      // Sort by date
      allUpdates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const total = allUpdates.length;
      const paginated = allUpdates.slice(skip, skip + pageSize);

      return {
        updates: paginated,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      console.error("Error fetching updates:", error);
      return {
        updates: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      };
    }
  }
}

const updatesService = new UpdatesService();

export async function getRecentUpdates(limit = 9): Promise<DashboardUpdate[]> {
  return await updatesService.getRecentUpdates(limit);
}

export async function getUpdates(
  filters?: UpdatesFilters,
): Promise<UpdatesResponse> {
  return await updatesService.getUpdates(filters);
}
