'use server';

import { getCurrentUser } from '@/domains/auth/server/session';
import handlers from '../server/handlers';
import { redirect } from 'next/navigation';
import { ReportStatus } from '@thrive/database';
import emailService from '@/services/email.service';
import logger from '@/utils/logger';

const updateReportStatus = async (id: string, status: ReportStatus) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const report = await handlers.updateReportStatus(id, status);

  // Send email notification to examiner
  // Using static import here because this is a "use server" action
  // Same pattern as completeReview.ts and rejectCase.ts
  try {
    await sendReportStatusEmailToExaminer(report, status);
  } catch (emailError) {
    logger.error('⚠️ Failed to send report status email:', emailError);
    // Don't throw error - email failure shouldn't block status update
  }

  return report;
};

async function sendReportStatusEmailToExaminer(report: any, status: ReportStatus) {
  const examiner = report.booking?.examination?.examiner;
  const userEmail = examiner?.user?.email;
  const firstName = examiner?.user?.firstName;
  const lastName = examiner?.user?.lastName;
  const caseNumber = report.booking?.examination?.caseNumber;
  const examinationType = report.booking?.examination?.examinationType?.name;

  // Get dateOfReport from the original report data (before update)
  let dateOfReport = 'Unknown';
  if (report.dateOfReport) {
    dateOfReport = new Date(report.dateOfReport).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  if (!userEmail || !firstName || !lastName) {
    logger.error('Missing examiner information for email');
    return;
  }

  if (status === 'APPROVED') {
    const result = await emailService.sendEmail(
      `Report Approved - Case ${caseNumber}`,
      'report-approved.html',
      {
        firstName,
        lastName,
        caseNumber,
        examinationType: examinationType || 'N/A',
        dateOfReport,
        CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_APP_URL || '',
      },
      userEmail
    );

    if (!result.success) {
      throw new Error((result as { success: false; error: string }).error);
    }
  } else if (status === 'REJECTED') {
    const result = await emailService.sendEmail(
      `Report Review Required - Case ${caseNumber}`,
      'report-rejected.html',
      {
        firstName,
        lastName,
        caseNumber,
        examinationType: examinationType || 'N/A',
        dateOfReport,
        CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_APP_URL || '',
      },
      userEmail
    );

    if (!result.success) {
      throw new Error((result as { success: false; error: string }).error);
    }
  }
}

export default updateReportStatus;
