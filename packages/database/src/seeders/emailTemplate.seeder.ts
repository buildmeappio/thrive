/* eslint-disable no-console */
import { PrismaClient } from '@thrive/database';

type AllowedVariable = {
  name: string;
  label: string;
  description?: string;
  example?: string;
  required?: boolean;
};

type TemplateSeed = {
  key: string; // logical key (we match admin-web filenames without .html)
  name: string;
  description?: string;
  subject: string;
  bodyHtml: string;
  allowedVariables: AllowedVariable[];
};

const DEFAULT_DESIGN_JSON = {}; // Keep seed resilient; admin-web can supply a default starter design if empty.

const TEMPLATES: TemplateSeed[] = [
  {
    key: 'admin-password-reset',
    name: 'Admin password reset',
    description: 'Password reset email for admin users.',
    subject: 'Reset Your Password - Thrive Admin',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password - Thrive Admin</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
      }
      .header img {
        width: 120px;
      }
      .body {
        margin-top: 20px;
        font-size: 16px;
        color: #333333;
      }
      .body p {
        margin-bottom: 20px;
        line-height: 1.6;
      }
      .button-container {
        text-align: center;
        margin: 30px 0;
      }
      .button {
        display: inline-block;
        padding: 14px 32px;
        background: linear-gradient(90deg, #00A8FF 0%, #01F4C8 100%);
        color: #ffffff;
        text-decoration: none;
        border-radius: 50px;
        font-weight: 600;
        font-size: 16px;
      }
      .footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
        font-size: 14px;
        color: #777777;
        text-align: center;
      }
      .note {
        margin-top: 20px;
        padding: 15px;
        background-color: #f9f9f9;
        border-left: 4px solid #00A8FF;
        font-size: 14px;
        color: #555555;
      }
      .footer a {
        color: #00A8FF;
        text-decoration: none;
      }
      .footer a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img
          src="{{CDN_URL}}/images/thriveLogo.png"
          alt="Thrive Logo" />
      </div>
      <div class="body">
        <p>Hi {{firstName}},</p>
        <p>
          We received a request to reset your password for your Thrive Admin
          account. If you made this request, click the button below to
          set a new password:
        </p>
        <div class="button-container">
          <a href="{{resetLink}}" class="button" style="display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #00A8FF 0%, #01F4C8 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">Reset Your Password</a>
        </div>
        <div class="note">
          <strong>Note:</strong> This password reset link will expire in 1 hour
          for security reasons. If you didn't request a password reset, you can
          safely ignore this email.
        </div>
      </div>
      <div class="footer">
        <p>
          If you have any questions or need assistance, feel free to contact us
          at
          <a href="mailto:support@thrivenetwork.ca">support@thrivenetwork.ca</a>.
        </p>
        <p>© 2025 Thrive Assessment & Care. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`,
    allowedVariables: [
      {
        name: 'CDN_URL',
        label: 'CDN URL',
        description: 'Base URL for static assets (logo, images).',
        required: true,
      },
      {
        name: 'firstName',
        label: 'First name',
        required: true,
      },
      {
        name: 'resetLink',
        label: 'Reset link',
        required: true,
      },
    ],
  },
  {
    key: 'admin-user-invite',
    name: 'Admin user invite',
    description: 'Invitation email for newly created admin users.',
    subject: 'Welcome to Thrive Admin',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Thrive Admin</title>
    <style>
      body {
        font-family: "Segoe UI", Arial, sans-serif;
        background-color: #f5f7fb;
        margin: 0;
        padding: 0;
      }
      .wrapper {
        max-width: 640px;
        margin: 0 auto;
        padding: 32px 16px;
      }
      .card {
        background-color: #ffffff;
        border-radius: 32px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
        padding: 40px;
      }
      .logo {
        text-align: center;
        margin-bottom: 24px;
      }
      .logo img {
        width: 150px;
        height: auto;
      }
      h1 {
        font-size: 24px;
        color: #0f172a;
        margin-bottom: 16px;
      }
      p {
        font-size: 15px;
        color: #475467;
        line-height: 1.7;
      }
      .credentials {
        margin: 24px 0;
        padding: 20px;
        border-radius: 24px;
        background: linear-gradient(135deg, rgba(0, 168, 255, 0.08), rgba(1, 244, 200, 0.08));
        border: 1px solid rgba(1, 160, 198, 0.2);
      }
      .credentials p {
        margin: 6px 0;
        font-weight: 600;
        color: #0f172a;
      }
      .button {
        display: inline-block;
        padding: 14px 32px;
        background: linear-gradient(90deg, #00a8ff 0%, #01f4c8 100%);
        color: #ffffff;
        font-weight: 600;
        border-radius: 999px;
        text-decoration: none;
        margin-top: 12px;
      }
      .note {
        margin-top: 24px;
        padding: 16px;
        border-left: 3px solid #00a8ff;
        background-color: #f0f9ff;
        color: #0f172a;
      }
      .footer {
        text-align: center;
        font-size: 13px;
        color: #94a3b8;
        margin-top: 32px;
      }
      @media (max-width: 600px) {
        .card {
          padding: 28px 20px;
        }
        h1 {
          font-size: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="logo">
          <img src="{{CDN_URL}}/images/thriveLogo.png" alt="Thrive Logo" />
        </div>
        <h1>Welcome aboard, {{firstName}}!</h1>
        <p>
          You have been granted access to the Thrive Admin portal with an
          Administrator role. Use the credentials below to sign in for the first
          time. You will be prompted to create your own password immediately
          after login.
        </p>

        <div class="credentials">
          <p>Email: {{email}}</p>
          <p>Temporary Password: {{temporaryPassword}}</p>
        </div>

        <p>
          Click the button below to visit the admin login page. For security
          reasons, this password is temporary and will expire after it is used.
        </p>

        <a class="button" href="{{loginLink}}" target="_blank" rel="noopener">
          Go to Thrive Admin
        </a>

        <div class="note">
          Tip: If you did not expect this email, please contact the Thrive
          support team immediately so we can secure your account.
        </div>

        <p>
          We&rsquo;re excited to have you on the platform. Reach out to
          <a href="mailto:support@thrivenetwork.ca">support@thrivenetwork.ca</a>
          if you need a hand.
        </p>
      </div>
      <p class="footer">© {{year}} Thrive Assessment & Care. All rights reserved.</p>
    </div>
  </body>
</html>`,
    allowedVariables: [
      { name: 'CDN_URL', label: 'CDN URL', required: true },
      { name: 'firstName', label: 'First name', required: true },
      { name: 'email', label: 'Email', required: true },
      { name: 'temporaryPassword', label: 'Temporary password', required: true },
      { name: 'loginLink', label: 'Login link', required: true },
      { name: 'year', label: 'Year', required: true },
    ],
  },
  {
    key: 'case-approval',
    name: 'Case approval (claimant appointment selection)',
    description: 'Sent to claimant to select appointment after case approval.',
    subject: 'Select Your Appointment - Thrive',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Select Your Appointment</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="{{CDN_URL}}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>
    
    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi {{firstName}},</p>
      
      <p>Please select your Appointment.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{availabilityLink}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #00A8FF 0%, #01F4C8 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">
          Select Appointment
        </a>
      </div>
      
      <p>If you have any questions, please contact us at 
        <a href="mailto:support@thrivenetwork.ca" style="color: #00A8FF;">support@thrivenetwork.ca</a>.
      </p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999999; text-align: center;">
      <p>© 2025 Thrive Assessment & Care. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    allowedVariables: [
      { name: 'CDN_URL', label: 'CDN URL', required: true },
      { name: 'firstName', label: 'First name', required: true },
      { name: 'availabilityLink', label: 'Availability link', required: true },
    ],
  },
  {
    key: 'case-rejection',
    name: 'Case rejection (organization/claimant)',
    description: 'Sent when a case is rejected (includes rejection message).',
    subject: 'Case {{caseNumber}} - Status Update',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Case Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="{{CDN_URL}}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>
    
    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi {{firstName}} {{lastName}},</p>
      
      <p>Thank you for submitting case <strong>{{caseNumber}}</strong> to Thrive Assessment & Care. After careful review, we regret to inform you that this case has not been approved at this time.</p>
      
      <p><strong>Reason for Rejection:</strong></p>
      <div style="background-color: #f9f9f9; border-left: 4px solid #C62828; padding: 15px; margin: 15px 0;">
        {{rejectionMessage}}
      </div>
      
      <p><strong>Case Details:</strong></p>
      <ul style="background-color: #f9f9f9; padding: 15px 15px 15px 35px; margin: 15px 0; border-radius: 5px;">
        <li><strong>Case Number:</strong> {{caseNumber}}</li>
        <li><strong>Organization:</strong> {{organizationName}}</li>
        <li><strong>Submitted Date:</strong> {{submittedDate}}</li>
      </ul>
      
      <p>If you have any questions or would like to discuss this decision, please don't hesitate to reach out to our support team.</p>
      
      <p>We appreciate your partnership with Thrive and look forward to working with you on future cases.</p>
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
</html>`,
    allowedVariables: [
      { name: 'CDN_URL', label: 'CDN URL', required: true },
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
      { name: 'caseNumber', label: 'Case number', required: true },
      { name: 'organizationName', label: 'Organization name', required: true },
      { name: 'submittedDate', label: 'Submitted date', required: true },
      { name: 'rejectionMessage', label: 'Rejection message', required: true },
    ],
  },
  {
    key: 'case-request-more-info',
    name: 'Case request more info (organization)',
    description: 'Sent when more info is needed for a case submission.',
    subject: 'Additional Information Required - Case {{caseNumber}}',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Additional Information Required</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="{{CDN_URL}}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>
    
    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi {{firstName}} {{lastName}},</p>
      
      <p>Thank you for submitting case <strong>{{caseNumber}}</strong> to Thrive Assessment & Care.</p>
      
      <p>We're currently reviewing this case and need some additional information to complete our assessment:</p>
      
      <div style="background-color: #f9f9f9; border-left: 4px solid #00A8FF; padding: 15px; margin: 15px 0;">
        {{requestMessage}}
      </div>
      
      <p><strong>Case Details:</strong></p>
      <ul style="background-color: #f9f9f9; padding: 15px 15px 15px 35px; margin: 15px 0; border-radius: 5px;">
        <li><strong>Case Number:</strong> {{caseNumber}}</li>
        <li><strong>Organization:</strong> {{organizationName}}</li>
        <li><strong>Submitted Date:</strong> {{submittedDate}}</li>
      </ul>
      
      <p>Please click the button below to review and update the case information:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{updateLink}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #00A8FF 0%, #01F4C8 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">
          Update Case Information
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666666;">
        <strong>Note:</strong> When you click the link above, you'll be taken to your dashboard where you can review and update the case details based on the feedback provided.
      </p>
      
      <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
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
</html>`,
    allowedVariables: [
      { name: 'CDN_URL', label: 'CDN URL', required: true },
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
      { name: 'caseNumber', label: 'Case number', required: true },
      { name: 'organizationName', label: 'Organization name', required: true },
      { name: 'submittedDate', label: 'Submitted date', required: true },
      { name: 'requestMessage', label: 'Request message', required: true },
      { name: 'updateLink', label: 'Update link', required: true },
    ],
  },
  {
    key: 'examiner-in-review',
    name: 'Examiner application in review',
    subject: 'Your Application is Now In Review',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application In Review</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="{{CDN_URL}}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>
    
    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi Dr. {{firstName}} {{lastName}},</p>
      
      <p>Good news! Your medical examiner application is now being reviewed by our team.</p>
      
      <div style="background-color: #E8F8F5; border-left: 4px solid #01F4C8; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #00695C; font-weight: 600;">📋 Status: In Review</p>
        <p style="margin: 5px 0 0 0; color: #00695C;">Our team is carefully reviewing your credentials and documentation.</p>
      </div>
      
      <p>We'll notify you of the next steps shortly. Thank you for your patience!</p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #777777; text-align: center;">
      <p>If you have any questions, contact us at 
        <a href="mailto:support@thrivenetwork.ca" style="color: #00A8FF;">support@thrivenetwork.ca</a>.
      </p>
      <p style="font-size: 12px; color: #999999; margin-top: 10px;">
        © 2025 Thrive Assessment & Care. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`,
    allowedVariables: [
      { name: 'CDN_URL', label: 'CDN URL', required: true },
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
    ],
  },
  {
    key: 'examiner-interview-scheduled',
    name: 'Examiner interview scheduled',
    subject: 'Interview Scheduled for Your Application',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Scheduled</title>
</head>

<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div
    style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="{{CDN_URL}}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>

    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi Dr. {{firstName}} {{lastName}},</p>

      <p>Great news! Your interview has been scheduled.</p>

      <div
        style="background: linear-gradient(135deg, rgba(0, 168, 255, 0.08), rgba(1, 244, 200, 0.08)); border-left: 4px solid #00A8FF; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #0f172a; font-weight: 600;">📅 Status: Interview Scheduled</p>
        <p style="margin: 5px 0 0 0; color: #0f172a;">Please select your preferred interview time slot from the
          available options.</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="{{scheduleInterviewLink}}"
          style="display: inline-block; background: linear-gradient(90deg, #00A8FF 0%, #01F4C8 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">Select
          Interview Time Slot</a>
      </div>

      <p>Please be prepared to discuss your experience and qualifications. We look forward to speaking with you!</p>
    </div>

    <div
      style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #777777; text-align: center;">
      <p>If you have any questions, contact us at
        <a href="mailto:support@thrivenetwork.ca" style="color: #00A8FF;">support@thrivenetwork.ca</a>.
      </p>
      <p style="font-size: 12px; color: #999999; margin-top: 10px;">
        © 2025 Thrive Assessment & Care. All rights reserved.
      </p>
    </div>
  </div>
</body>

</html>`,
    allowedVariables: [
      { name: 'CDN_URL', label: 'CDN URL', required: true },
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
      {
        name: 'scheduleInterviewLink',
        label: 'Schedule interview link',
        required: true,
      },
    ],
  },
  {
    key: 'examiner-interview-completed',
    name: 'Examiner interview completed',
    subject: 'Interview Completed - Application Update',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Completed</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="{{CDN_URL}}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>
    
    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi Dr. {{firstName}} {{lastName}},</p>
      
      <p>Thank you for completing your interview with us!</p>
      
      <div style="background-color: #EEF2FF; border-left: 4px solid #6366F1; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #4338CA; font-weight: 600;">✅ Status: Interview Completed</p>
        <p style="margin: 5px 0 0 0; color: #4338CA;">Our team is reviewing your interview and will update you on the next steps.</p>
      </div>
      
      <p>We appreciate your time and interest in joining the Thrive network.</p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #777777; text-align: center;">
      <p>If you have any questions, contact us at 
        <a href="mailto:support@thrivenetwork.ca" style="color: #00A8FF;">support@thrivenetwork.ca</a>.
      </p>
      <p style="font-size: 12px; color: #999999; margin-top: 10px;">
        © 2025 Thrive Assessment & Care. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`,
    allowedVariables: [
      { name: 'CDN_URL', label: 'CDN URL', required: true },
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
    ],
  },
  {
    key: 'examiner-contract-sent',
    name: 'Examiner contract sent',
    subject: 'Sign Your Independent Medical Examiner Agreement',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign Your Contract</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="{{CDN_URL}}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>
    
    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi Dr. {{firstName}} {{lastName}},</p>
      
      <p>Congratulations! Your application has progressed to the contract stage.</p>
      
      <p>Your Independent Medical Examiner Agreement is ready for your signature. Please click the button below to review and sign your contract.</p>
      
      <div style="background-color: #E8F8F5; border-left: 4px solid #01F4C8; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #00695C; font-weight: 600;">📝 Contract Ready</p>
        <p style="margin: 5px 0 0 0; color: #00695C;">Your personalized contract includes your terms and service expectations.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{contractSigningLink}}" style="display: inline-block; background: linear-gradient(to right, #00A8FF, #01F4C8); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px;">
          Sign Your Contract
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666666;">
        <strong>What happens next:</strong>
      </p>
      <ul style="background-color: #f9f9f9; padding: 15px 15px 15px 35px; margin: 15px 0; border-radius: 5px; font-size: 14px; color: #666666;">
        <li>Review your contract terms</li>
        <li>Sign electronically using the signature pad</li>
        <li>Our team will review your signed contract</li>
        <li>You'll receive final approval confirmation</li>
      </ul>
      
      <p>If you have any questions or concerns about the contract, please don't hesitate to contact us.</p>
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
</html>`,
    allowedVariables: [
      { name: 'CDN_URL', label: 'CDN URL', required: true },
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
      {
        name: 'contractSigningLink',
        label: 'Contract signing link',
        required: true,
      },
    ],
  },
  {
    key: 'examiner-contract-signed',
    name: 'Examiner contract signed',
    subject: 'Contract Confirmed - Final Approval Pending',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contract Confirmed</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="{{CDN_URL}}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>
    
    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi Dr. {{firstName}} {{lastName}},</p>
      
      <p>Excellent! Your signed contract has been confirmed by our team.</p>
      
      <div style="background-color: #ECFDF5; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #047857; font-weight: 600;">✅ Status: Contract Signed</p>
        <p style="margin: 5px 0 0 0; color: #047857;">Your contract is confirmed. Final approval is being processed.</p>
      </div>
      
      <p>You're almost there! We'll notify you once your application is fully approved.</p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #777777; text-align: center;">
      <p>If you have any questions, contact us at 
        <a href="mailto:support@thrivenetwork.ca" style="color: #00A8FF;">support@thrivenetwork.ca</a>.
      </p>
      <p style="font-size: 12px; color: #999999; margin-top: 10px;">
        © 2025 Thrive Assessment & Care. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`,
    allowedVariables: [
      { name: 'CDN_URL', label: 'CDN URL', required: true },
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
    ],
  },
  {
    key: 'examiner-rejection',
    name: 'Examiner application rejected',
    subject: 'Thrive Medical Examiner Application - Status Update',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="{{CDN_URL}}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>
    
    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi Dr. {{firstName}} {{lastName}},</p>
      
      <p>Thank you for your interest in joining Thrive as a Medical Examiner. After careful review, we regret to inform you that your application has not been approved at this time.</p>
      
      <p><strong>Reason:</strong></p>
      <div style="background-color: #f9f9f9; border-left: 4px solid #C62828; padding: 15px; margin: 15px 0;">
        {{rejectionMessage}}
      </div>
      
      <p>We appreciate your interest in working with Thrive and encourage you to reapply in the future if circumstances change.</p>
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
</html>`,
    allowedVariables: [
      { name: 'CDN_URL', label: 'CDN URL', required: true },
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
      { name: 'rejectionMessage', label: 'Rejection message', required: true },
    ],
  },
  {
    key: 'examiner-request-more-info',
    name: 'Examiner request more info',
    subject: 'Thrive Medical Examiner Application - Additional Information Required',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Additional Information Required</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="{{CDN_URL}}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>
    
    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi Dr. {{firstName}} {{lastName}},</p>
      
      <p>Thank you for submitting your application to become a Medical Examiner with Thrive.</p>
      
      <p>We're currently reviewing your profile and need some additional information to complete our assessment:</p>
      
      <div style="background-color: #f9f9f9; border-left: 4px solid #00A8FF; padding: 15px; margin: 15px 0;">
        {{requestMessage}}
      </div>
      
      {{#if documentsRequired}}
      <div style="background-color: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; margin: 15px 0;">
        <strong>⚠️ Important:</strong> Please ensure you upload all required documents when resubmitting your application.
      </div>
      {{/if}}
      
      <p>Please click the button below to resubmit your application with the updated information:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{resubmitLink}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #00A8FF 0%, #01F4C8 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">
          Update My Application
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666666;">
        <strong>Note:</strong> When you click the link above, you'll be taken through the application process again. Your previously submitted information will be pre-filled in the forms, so you only need to update the requested information.
      </p>
      
      <p style="font-size: 14px; color: #666666;">
        This link will expire in 30 days. If you need assistance, please contact us at 
        <a href="mailto:support@thrivenetwork.ca" style="color: #00A8FF;">support@thrivenetwork.ca</a>.
      </p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #777777; text-align: center;">
      <p>If you have any questions, feel free to contact us at 
        <a href="mailto:support@thrivenetwork.ca" style="color: #00A8FF;">support@thrivenetwork.ca</a>.
      </p>
      <p style="font-size: 12px; color: #999999; margin-top: 10px;">
        © 2025 Thrive Assessment & Care. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`,
    allowedVariables: [
      { name: 'CDN_URL', label: 'CDN URL', required: true },
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
      { name: 'requestMessage', label: 'Request message', required: true },
      { name: 'resubmitLink', label: 'Resubmit link', required: true },
      {
        name: 'documentsRequired',
        label: 'Documents required?',
        description: 'Controls the conditional warning block in the template.',
        required: false,
      },
    ],
  },
  {
    key: 'organization-rejection',
    name: 'Organization application rejected',
    subject: 'Organization Application - Status Update',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="{{CDN_URL}}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>
    
    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi {{firstName}} {{lastName}},</p>
      
      <p>Thank you for your interest in partnering with Thrive Assessment & Care. After careful review, we regret to inform you that the application for <strong>{{organizationName}}</strong> has not been approved at this time.</p>
      
      <p><strong>Reason:</strong></p>
      <div style="background-color: #f9f9f9; border-left: 4px solid #C62828; padding: 15px; margin: 15px 0;">
        {{rejectionMessage}}
      </div>
      
      <p>We appreciate your interest in working with Thrive and encourage you to reapply in the future if circumstances change.</p>
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
</html>`,
    allowedVariables: [
      { name: 'CDN_URL', label: 'CDN URL', required: true },
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
      {
        name: 'organizationName',
        label: 'Organization name',
        required: true,
      },
      { name: 'rejectionMessage', label: 'Rejection message', required: true },
    ],
  },
  {
    key: 'organization-request-more-info',
    name: 'Organization request more info',
    subject: 'Additional Information Required - Organization Application',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Additional Information Required</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="{{CDN_URL}}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>
    
    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi {{firstName}} {{lastName}},</p>
      
      <p>Thank you for submitting your organization application to Thrive Assessment & Care.</p>
      
      <p>We're currently reviewing <strong>{{organizationName}}</strong>'s profile and need some additional information to complete our assessment:</p>
      
      <div style="background-color: #f9f9f9; border-left: 4px solid #00A8FF; padding: 15px; margin: 15px 0;">
        {{requestMessage}}
      </div>
      
      <p>Please click the button below to resubmit your application with the updated information:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{resubmitLink}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #00A8FF 0%, #01F4C8 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">
          Update Application
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666666;">
        <strong>Note:</strong> When you click the link above, you'll be taken through the application process again. Your previously submitted information will be pre-filled in the forms, so you only need to update the requested information.
      </p>
      
      <p style="font-size: 14px; color: #666666;">
        This link will expire in 30 days. If you need assistance, please contact us at 
        <a href="mailto:support@thrivenetwork.ca" style="color: #00A8FF;">support@thrivenetwork.ca</a>.
      </p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #777777; text-align: center;">
      <p>If you have any questions, feel free to contact us at 
        <a href="mailto:support@thrivenetwork.ca" style="color: #00A8FF;">support@thrivenetwork.ca</a>.
      </p>
      <p style="font-size: 12px; color: #999999; margin-top: 10px;">
        © 2025 Thrive Assessment & Care. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`,
    allowedVariables: [
      { name: 'CDN_URL', label: 'CDN URL', required: true },
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
      {
        name: 'organizationName',
        label: 'Organization name',
        required: true,
      },
      { name: 'requestMessage', label: 'Request message', required: true },
      { name: 'resubmitLink', label: 'Resubmit link', required: true },
    ],
  },
  {
    key: 'report-approved',
    name: 'Report approved',
    subject: 'Report Approved - Case {{caseNumber}}',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Report Approved</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="{{CDN_URL}}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>
    
    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi Dr. {{firstName}} {{lastName}},</p>
      
      <p>Your report for case <strong>{{caseNumber}}</strong> has been reviewed and approved.</p>
      
      <div style="background-color: #E8F8F5; border-left: 4px solid #01F4C8; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #00695C; font-weight: 600;">✓ Report Approved</p>
        <p style="margin: 5px 0 0 0; color: #00695C;">Your report has been successfully reviewed and approved.</p>
      </div>
      
      <p><strong>Case Details:</strong></p>
      <ul style="background-color: #f9f9f9; padding: 15px 15px 15px 35px; margin: 15px 0; border-radius: 5px;">
        <li><strong>Case Number:</strong> {{caseNumber}}</li>
        <li><strong>Examination Type:</strong> {{examinationType}}</li>
        <li><strong>Date of Report:</strong> {{dateOfReport}}</li>
      </ul>
      
      <p>Thank you for your submission. If you have any questions, please contact us at 
        <a href="mailto:support@thrivenetwork.ca" style="color: #00A8FF;">support@thrivenetwork.ca</a>.
      </p>
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
</html>`,
    allowedVariables: [
      { name: 'CDN_URL', label: 'CDN URL', required: true },
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
      { name: 'caseNumber', label: 'Case number', required: true },
      { name: 'examinationType', label: 'Examination type', required: true },
      { name: 'dateOfReport', label: 'Date of report', required: true },
    ],
  },
  {
    key: 'report-rejected',
    name: 'Report rejected',
    subject: 'Report Review Required - Case {{caseNumber}}',
    bodyHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Report Review Required</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="{{CDN_URL}}/images/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>
    
    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi Dr. {{firstName}} {{lastName}},</p>
      
      <p>Your report for case <strong>{{caseNumber}}</strong> has been reviewed and requires your attention.</p>
      
      <div style="background-color: #FFEBEE; border-left: 4px solid #C62828; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #C62828; font-weight: 600;">⚠ Report Review Required</p>
        <p style="margin: 5px 0 0 0; color: #C62828;">Your report has been rejected for this examination. Please review it and make the necessary corrections.</p>
      </div>
      
      <p><strong>Case Details:</strong></p>
      <ul style="background-color: #f9f9f9; padding: 15px 15px 15px 35px; margin: 15px 0; border-radius: 5px;">
        <li><strong>Case Number:</strong> {{caseNumber}}</li>
        <li><strong>Examination Type:</strong> {{examinationType}}</li>
        <li><strong>Date of Report:</strong> {{dateOfReport}}</li>
      </ul>
      
      <p><strong>Next Steps:</strong></p>
      <p>Please log in to your account to review the report and make the necessary corrections. If you have any questions or need clarification, please don't hesitate to contact our support team.</p>
      
      <p>We appreciate your attention to this matter and look forward to receiving your updated report.</p>
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
</html>`,
    allowedVariables: [
      { name: 'CDN_URL', label: 'CDN URL', required: true },
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
      { name: 'caseNumber', label: 'Case number', required: true },
      { name: 'examinationType', label: 'Examination type', required: true },
      { name: 'dateOfReport', label: 'Date of report', required: true },
    ],
  },
];

class EmailTemplateSeeder {
  private static instance: EmailTemplateSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): EmailTemplateSeeder {
    if (!EmailTemplateSeeder.instance) {
      EmailTemplateSeeder.instance = new EmailTemplateSeeder(db);
    }
    return EmailTemplateSeeder.instance;
  }

  public async run() {
    console.log('🚀 Starting email template seed process...');
    console.log(`📝 Seeding ${TEMPLATES.length} email template(s)...`);

    for (const t of TEMPLATES) {
      console.log(`\n📦 Processing email template: "${t.key}"`);
      const existing = await this.db.emailTemplate.findFirst({
        where: { key: t.key },
      });

      if (!existing) {
        console.log(`Creating template: ${t.key}`);
        await this.db.$transaction(async tx => {
          const created = await tx.emailTemplate.create({
            data: {
              key: t.key,
              name: t.name,
              description: t.description,
              isActive: false,
              allowedVariables: t.allowedVariables as any,
            },
          });

          const version = await tx.emailTemplateVersion.create({
            data: {
              templateId: created.id,
              version: 1,
              subject: t.subject,
              bodyHtml: t.bodyHtml,
              designJson: DEFAULT_DESIGN_JSON as any,
              createdByUserId: null,
            },
          });

          await tx.emailTemplate.update({
            where: { id: created.id },
            data: { currentVersionId: version.id },
          });
        });
        console.log(`✅ Created template + version: ${t.key}`);
        continue;
      }

      // Ensure at least one version exists and currentVersionId is set.
      const latestVersion = await this.db.emailTemplateVersion.findFirst({
        where: { templateId: existing.id },
        orderBy: { version: 'desc' },
      });

      if (!latestVersion) {
        console.log(`Template exists but has no versions; creating v1: ${t.key}`);
        const version = await this.db.emailTemplateVersion.create({
          data: {
            templateId: existing.id,
            version: 1,
            subject: t.subject,
            bodyHtml: t.bodyHtml,
            designJson: DEFAULT_DESIGN_JSON as any,
            createdByUserId: null,
          },
        });

        await this.db.emailTemplate.update({
          where: { id: existing.id },
          data: { currentVersionId: version.id },
        });
        console.log(`✅ Backfilled v1 for template: ${t.key}`);
        continue;
      }

      if (!existing.currentVersionId) {
        console.log(
          `Template has versions but no currentVersionId; setting to v${latestVersion.version}: ${t.key}`
        );
        await this.db.emailTemplate.update({
          where: { id: existing.id },
          data: { currentVersionId: latestVersion.id },
        });
      }

      console.log(`ℹ️ Template already exists, leaving as-is: ${t.key}`);
    }

    console.log('✅ Email template seed process completed.');
  }
}

export default EmailTemplateSeeder;
