/**
 * Email template for approved an examiner application
 */

type ExaminerApprovedParams = {
    firstName: string;
    lastName: string;
    createAccountLink: string;
};

function escapeHtml(input: string) {
    return String(input)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function generateExaminerApprovedEmail({
    firstName,
    lastName,
    createAccountLink,
}: ExaminerApprovedParams): string {
    return `
  <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Approval</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }

    .container {
      width: 600px;
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
    }

    .button {
      display: inline-block;
      background-color: #01F4C8;
      color: #ffffff;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      text-align: center;
    }

    .footer {
      margin-top: 30px;
      font-size: 14px;
      color: #777777;
      text-align: center;
    }
  </style>
</head>

<body>

  <div class="container">
    <div class="header">
      <img src="https://assets.thriveassessmentcare.com/images/thriveLogo.png" alt="Thrive Logo">
    </div>

    <div class="body">
      <p>Hi Dr. ${escapeHtml(firstName)} ${escapeHtml(lastName)},</p>
      <p>We're excited to let you know that your profile has been successfully reviewed and approved on the Thrive
        platform. You are now an active Medical Examiner and eligible to receive IME case opportunities through our
        system.</p>
      <p><strong>What Happens Next:</strong></p>
      <p>You can log in to view and manage your profile, documents, and upcoming IMEs.</p>
      <a href="${escapeHtml(createAccountLink)}" class="button">Create Your Account</a>
    </div>

    <div class="footer">
      <p>If you have any questions or need assistance, feel free to contact us at <a
          href="mailto:support@thrivenetwork.ca">support@thrivenetwork.ca</a>.</p>
    </div>
  </div>

</body>

</html>


    `;
}

export const EXAMINER_APPROVED_SUBJECT = "Your Thrive Medical Examiner Profile Has Been Approved";

