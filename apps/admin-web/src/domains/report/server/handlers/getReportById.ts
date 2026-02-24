'use server';
import * as ReportService from '../report.service';
import { ReportDto } from '../dto/report.dto';

const getReportById = async (id: string) => {
  const report = await ReportService.getReportById(id);
  const reportDetails = await ReportDto.toReportDetailDto(report);
  return reportDetails;
};

export default getReportById;
