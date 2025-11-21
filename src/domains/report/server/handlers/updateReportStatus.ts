import reportService from "../report.service";
import { ReportStatus } from "@prisma/client";

const updateReportStatus = async (id: string, status: ReportStatus) => {
  const report = await reportService.updateReportStatus(id, status);
  return report;
};

export default updateReportStatus;
