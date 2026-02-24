'use server';

import examinerService from '../server/examiner.service';
import { ExaminerDto } from '../server/dto/examiner.dto';
import { sendMail } from '@/lib/email';
import { ENV } from '@/constants/variables';
import logger from '@/utils/logger';
import { HttpError } from '@/utils/httpError';

export const reactivateExaminer = async (id: string) => {
  try {
    const result = await examinerService.reactivateExaminer(id);

    if (!result) {
      throw new HttpError(404, 'Examiner not found');
    }

    const examinerData = await ExaminerDto.toExaminerData(result as any);

    // Send reactivation notification email
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Reactivated</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center;">
            <img src="${ENV.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
          </div>
          
          <div style="margin-top: 20px; font-size: 16px; color: #333333;">
            <p>Hi Dr. ${examinerData.name},</p>
            
            <p>Great news! Your Medical Examiner profile with Thrive has been reactivated.</p>
            
            <div style="background-color: #D4EDDA; border-left: 4px solid #28A745; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #155724; font-weight: 600;">✅ Account Status: Active</p>
              <p style="margin: 5px 0 0 0; color: #155724;">Your access to the platform has been fully restored.</p>
            </div>
            
            <p>You can now resume conducting IME assessments and accessing all platform features.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${ENV.NEXT_PUBLIC_APP_URL}/examiner/dashboard" style="display: inline-block; background: linear-gradient(to right, #00A8FF, #01F4C8); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px;">
                Access Your Dashboard
              </a>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #777777; text-align: center;">
            <p>If you have any questions or need assistance, feel free to contact us at 
              <a href="mailto:support@thrivenetwork.ca" style="color: #00A8FF;">support@thrivenetwork.ca</a>.
            </p>
            <p style="font-size: 12px; color: #999999; margin-top: 10px;">
              © 2025 Thrive Assessment & Care. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendMail({
      to: examinerData.email,
      subject: 'Account Reactivated - Thrive Medical Examiner',
      html: emailHtml,
    });

    return {
      success: true,
      data: examinerData,
    };
  } catch (error) {
    logger.error('Failed to reactivate examiner:', error);
    return {
      success: false,
      error:
        error instanceof HttpError
          ? error.message
          : 'Failed to reactivate examiner. Please try again.',
    };
  }
};
