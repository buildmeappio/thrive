import { NextRequest, NextResponse } from 'next/server';
// import { getCurrentUser } from '@/domains/auth/server/session'; // Commented out - not currently used
import prisma from '@/lib/prisma';
import emailService from '@/services/emailService';
import createSecureLink from '@/utils/createSecureLink';
import log from '@/utils/log';

/**
 * API endpoint to approve an examination and send approval link to claimant
 * POST /api/examinations/[id]/approve
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: examinationId } = await params;

    // Get current user for authorization
    // const currentUser = await getCurrentUser();
    // if (!currentUser?.accountId) {
    //   return NextResponse.json({ error: 'Unauthorized: User not authenticated' }, { status: 401 });
    // }

    // Get examination with all related data using separate queries
    const examination = await prisma.examination.findUnique({
      where: { id: examinationId },
    });

    if (!examination) {
      return NextResponse.json({ error: 'Examination not found' }, { status: 404 });
    }

    // Get related data
    const [caseData, claimant, examinationType, status] = await Promise.all([
      prisma.case.findUnique({
        where: { id: examination.caseId },
        include: {
          organization: true,
        },
      }),
      prisma.claimant.findUnique({
        where: { id: (examination as any).claimantId },
        include: { address: true },
      }),
      prisma.examinationType.findUnique({
        where: { id: examination.examinationTypeId },
      }),
      prisma.caseStatus.findUnique({
        where: { id: examination.statusId },
      }),
    ]);

    if (!caseData || !claimant || !examinationType || !status) {
      return NextResponse.json({ error: 'Examination data incomplete' }, { status: 500 });
    }

    // Check if user has permission to approve this examination
    // For now, we'll do a simple check - in production, you'd want to verify the user is a manager of the organization
    const hasPermission = caseData.organization?.id; // Simplified permission check

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not have permission to approve this examination' },
        { status: 403 }
      );
    }

    // Check if examination is already in a status that doesn't need approval
    if (status.name === 'Waiting to be Scheduled') {
      return NextResponse.json(
        { error: 'Examination is already approved and waiting to be scheduled' },
        { status: 400 }
      );
    }

    if (status.name === 'Ready to Appointment') {
      return NextResponse.json(
        { error: 'Examination is already ready for appointment. Availability has been submitted.' },
        { status: 400 }
      );
    }

    // Get the "Waiting to be Scheduled" status
    const approvedStatus = await prisma.caseStatus.findFirst({
      where: { name: 'Waiting to be Scheduled' },
    });

    if (!approvedStatus) {
      return NextResponse.json(
        { error: 'Waiting to be Scheduled status not found in system' },
        { status: 500 }
      );
    }

    // Update examination status to "Waiting to be Scheduled"
    await prisma.examination.update({
      where: { id: examinationId },
      data: { statusId: approvedStatus.id },
    });

    // Generate secure link for claimant
    const secureLink = await createSecureLink(examinationId, 'claimant', 24);

    // Prepare email data
    const claimantName = `${claimant.firstName} ${claimant.lastName}`;
    const examinationTypeName = examinationType.name;
    const caseNumber = examination.caseNumber;
    const organizationName = caseData.organization?.name || 'Thrive Assessment Care';

    // Send approval email to claimant
    const emailResult = await emailService.sendEmail(
      `Examination Ready for Scheduling - ${caseNumber}`,
      'examination-approved.html',
      {
        claimantName,
        examinationType: examinationTypeName,
        caseNumber,
        organizationName,
        approvalLink: secureLink,
        dashboardUrl: process.env.FRONTEND_URL,
      },
      claimant.emailAddress ?? ''
    );

    if (!emailResult.success) {
      log.error('Failed to send approval email:', emailResult.error);
      return NextResponse.json(
        {
          error: 'Examination approved but failed to send email notification',
          details: emailResult.error,
        },
        { status: 500 }
      );
    }

    log.info(`Examination ${examinationId} approved and email sent to ${claimant.emailAddress}`);

    return NextResponse.json({
      success: true,
      message: 'Examination approved successfully',
      data: {
        examinationId,
        caseNumber,
        claimantEmail: claimant.emailAddress,
        status: 'Waiting to be Scheduled',
        approvalLink: secureLink,
      },
    });
  } catch (error) {
    log.error('Error approving examination:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
