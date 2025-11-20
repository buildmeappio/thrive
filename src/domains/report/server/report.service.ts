import prisma from "@/lib/db";
import { HttpError } from "@/utils/httpError";
import { ReportStatus } from "@prisma/client";

class ReportService {
  async getReportById(id: string) {
    try {
      const report = await prisma.report.findUnique({
        where: { id },
        include: {
          booking: {
            include: {
              examination: {
                include: {
                  examinationType: true,
                  status: true,
                },
              },
              claimant: {
                include: {
                  address: true,
                },
              },
            },
          },
          dynamicSections: {
            where: {
              deletedAt: null,
            },
            orderBy: {
              order: "asc",
            },
          },
          referralDocuments: {
            where: {
              deletedAt: null,
            },
            include: {
              document: true,
            },
          },
        },
      });

      if (!report) {
        throw HttpError.notFound("Report not found");
      }

      return report;
    } catch (error) {
      throw HttpError.fromError(error, "Failed to get report");
    }
  }

  async updateReportStatus(id: string, status: ReportStatus) {
    try {
      // Fetch report with examiner information before updating
      const reportWithDetails = await prisma.report.findUnique({
        where: { id },
        include: {
          booking: {
            include: {
              examination: {
                include: {
                  examinationType: true,
                  examiner: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!reportWithDetails) {
        throw HttpError.notFound("Report not found");
      }

      // Update report status
      const updatedReport = await prisma.report.update({
        where: { id },
        data: { status },
      });

      // Return report with examiner details and dateOfReport for email sending
      return {
        ...updatedReport,
        dateOfReport: reportWithDetails.dateOfReport,
        booking: reportWithDetails.booking,
      };
    } catch (error) {
      throw HttpError.fromError(error, "Failed to update report status");
    }
  }

  async updateReportContent(
    id: string,
    data: {
      referralQuestionsResponse?: string;
      dynamicSections?: Array<{
        id?: string;
        title: string;
        content: string;
        order: number;
      }>;
    }
  ) {
    try {
      // Update referral questions response if provided
      if (data.referralQuestionsResponse !== undefined) {
        await prisma.report.update({
          where: { id },
          data: {
            referralQuestionsResponse: data.referralQuestionsResponse,
          },
        });
      }

      // Update dynamic sections if provided
      if (data.dynamicSections) {
        // Get existing sections
        const existingSections = await prisma.reportDynamicSection.findMany({
          where: {
            reportId: id,
            deletedAt: null,
          },
        });

        const existingIds = existingSections.map((s) => s.id);
        const incomingIds = data.dynamicSections
          .map((s) => s.id)
          .filter((id): id is string => id !== undefined);

        // Soft delete sections that are not in the incoming data
        const idsToDelete = existingIds.filter(
          (id) => !incomingIds.includes(id)
        );
        if (idsToDelete.length > 0) {
          await prisma.reportDynamicSection.updateMany({
            where: {
              id: { in: idsToDelete },
              reportId: id,
            },
            data: {
              deletedAt: new Date(),
            },
          });
        }

        // Update or create sections
        for (const section of data.dynamicSections) {
          if (section.id && !section.id.startsWith("new-")) {
            // Update existing section (only if it's a real UUID, not a temp ID)
            try {
              await prisma.reportDynamicSection.update({
                where: { id: section.id },
                data: {
                  title: section.title,
                  content: section.content,
                  order: section.order,
                },
              });
            } catch (error) {
              // If update fails (section might have been deleted), create new one
              await prisma.reportDynamicSection.create({
                data: {
                  reportId: id,
                  title: section.title,
                  content: section.content,
                  order: section.order,
                },
              });
            }
          } else {
            // Create new section
            await prisma.reportDynamicSection.create({
              data: {
                reportId: id,
                title: section.title,
                content: section.content,
                order: section.order,
              },
            });
          }
        }
      }

      // Return updated report
      return await this.getReportById(id);
    } catch (error) {
      throw HttpError.fromError(error, "Failed to update report content");
    }
  }
}

export default new ReportService();
