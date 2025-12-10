"use server";
import * as ReportService from "../report.service";
import { ReportDto } from "../dto/report.dto";

const updateReportContent = async (
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
) => {
  const report = await ReportService.updateReportContent(id, data);
  const reportDetails = await ReportDto.toReportDetailDto(report);
  return reportDetails;
};

export default updateReportContent;

