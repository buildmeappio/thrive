'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { sendMail } from '@/lib/email';
import { signAccountToken, signContractToken } from '@/lib/jwt';
import { Roles } from '@/domains/auth/constants/roles';
import { getCurrentUser } from '@/domains/auth/server/session';
import contractService from '../server/contract.service';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import {
  generateExaminerContractSentEmail,
  EXAMINER_CONTRACT_SENT_SUBJECT,
} from '@/emails/examiner-status-updates';
import { checkEntityType } from '../utils/checkEntityType';
import { ExaminerStatus } from '@thrive/database';

export async function sendContract(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw HttpError.unauthorized('You must be logged in to send contract');
    }

    // Check if it's an application or examiner
    const entityType = await checkEntityType(id);

    if (entityType === 'application') {
      // Handle application
      const application = await prisma.examinerApplication.findUnique({
        where: { id },
      });

      if (!application) {
        throw new Error('Application not found');
      }

      // Check if fee structure exists
      if (
        !application.IMEFee ||
        !application.recordReviewFee ||
        !application.cancellationFee ||
        !application.paymentTerms
      ) {
        throw new Error(
          'Fee structure not found. Please add fee structure before sending contract.'
        );
      }

      const firstName = application.firstName || '';
      const lastName = application.lastName || '';
      const examinerEmail = application.email;

      // Create contract record using contract service
      logger.log('📄 Creating contract for application...');
      const contractResult = await contractService.createAndSendContractForApplication(
        id,
        user.accountId
      );

      if (!contractResult.success) {
        throw new Error(
          'error' in contractResult ? contractResult.error : 'Failed to create contract'
        );
      }

      logger.log('✅ Contract created successfully:', contractResult.contractId);

      // Generate JWT token for contract signing (using application token)
      logger.log('🔐 Generating contract signing token...');
      const token = signContractToken({
        contractId: contractResult.contractId!,
        examinerProfileId: '', // Not available yet for applications
      });

      // Create contract signing link using CONTRACT ID
      const contractSigningLink = `${process.env.NEXT_PUBLIC_APP_URL}/examiner/contract/${contractResult.contractId}?token=${token}&applicationId=${id}`;

      // Send email with contract signing button
      logger.log('📧 Sending contract signing email...');

      const htmlTemplate = generateExaminerContractSentEmail({
        firstName,
        lastName,
        contractSigningLink,
      });

      await sendMail({
        to: examinerEmail,
        subject: EXAMINER_CONTRACT_SENT_SUBJECT,
        html: htmlTemplate,
      });

      logger.log(`✅ Contract signing email sent to ${examinerEmail}`);

      // Update application status to CONTRACT_SENT
      await prisma.examinerApplication.update({
        where: { id },
        data: {
          status: ExaminerStatus.CONTRACT_SENT,
        },
      });

      // Revalidate the application page
      revalidatePath(`/examiner/application/${id}`);

      return {
        success: true,
        message: 'Contract signing link sent successfully',
      };
    } else if (entityType === 'examiner') {
      // Handle examiner (existing logic)
      const examiner = await prisma.examinerProfile.findUnique({
        where: { id },
        include: {
          account: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!examiner) {
        throw new Error('Examiner not found');
      }

      const firstName = examiner.account.user.firstName;
      const lastName = examiner.account.user.lastName;
      const examinerEmail = examiner.account.user.email;
      const userId = examiner.account.user.id;
      const accountId = examiner.accountId;

      // Create contract record using contract service (same as approve flow)
      logger.log('📄 Creating contract for examiner...');
      const contractResult = await contractService.createAndSendContract(id, user.accountId);

      if (!contractResult.success) {
        throw new Error(
          'error' in contractResult ? contractResult.error : 'Failed to create contract'
        );
      }

      logger.log('✅ Contract created successfully:', contractResult.contractId);

      // Generate JWT token for contract signing
      logger.log('🔐 Generating contract signing token...');
      const token = signAccountToken({
        email: examinerEmail,
        id: userId,
        accountId: accountId,
        role: Roles.MEDICAL_EXAMINER,
      });

      // Create contract signing link using CONTRACT ID (not examiner profile ID)
      const contractSigningLink = `${process.env.NEXT_PUBLIC_APP_URL}/examiner/contract/${contractResult.contractId}?token=${token}`;

      // Send email with contract signing button
      logger.log('📧 Sending contract signing email...');

      const htmlTemplate = generateExaminerContractSentEmail({
        firstName,
        lastName,
        contractSigningLink,
      });

      await sendMail({
        to: examinerEmail,
        subject: EXAMINER_CONTRACT_SENT_SUBJECT,
        html: htmlTemplate,
      });

      logger.log(`✅ Contract signing email sent to ${examinerEmail}`);

      // Update ExaminerProfile status to CONTRACT_SENT (workflow status)
      await prisma.examinerProfile.update({
        where: { id },
        data: {
          status: ExaminerStatus.CONTRACT_SENT,
        },
      });

      // Revalidate the examiner page
      revalidatePath(`/examiner/${id}`);

      return {
        success: true,
        message: 'Contract signing link sent successfully',
      };
    } else {
      throw new Error('Application or examiner not found');
    }
  } catch (error) {
    logger.error('Error sending contract:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send contract',
    };
  }
}
