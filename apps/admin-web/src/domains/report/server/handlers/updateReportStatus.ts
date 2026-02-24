'use server';
import * as ReportService from '../report.service';
import { ReportStatus } from '@thrive/database';

const updateReportStatus = async (id: string, status: ReportStatus) => {
  const report = await ReportService.updateReportStatus(id, status);
  return report;
};

export default updateReportStatus;
