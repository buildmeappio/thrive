/**
 * Email templates for examiner status updates
 */

import fs from "fs";
import path from "path";

function escapeHtml(input: string) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function loadTemplate(templateName: string): string {
  const templatePath = path.join(process.cwd(), "templates", "emails", `${templateName}.html`);
  return fs.readFileSync(templatePath, "utf-8");
}

function renderTemplate(template: string, variables: Record<string, string>): string {
  let rendered = template;
  
  // Replace {{variable}} with actual values
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    rendered = rendered.replace(regex, escapeHtml(value));
  });
  
  // Replace CDN_URL
  rendered = rendered.replace(/{{CDN_URL}}/g, process.env.NEXT_PUBLIC_CDN_URL || "");
  
  return rendered;
}

// In Review
export function generateExaminerInReviewEmail(params: { firstName: string; lastName: string }): string {
  const template = loadTemplate("examiner-in-review");
  return renderTemplate(template, params);
}

export const EXAMINER_IN_REVIEW_SUBJECT = "Your Application is Now In Review";

// Interview Scheduled
export function generateExaminerInterviewScheduledEmail(params: { firstName: string; lastName: string }): string {
  const template = loadTemplate("examiner-interview-scheduled");
  return renderTemplate(template, params);
}

export const EXAMINER_INTERVIEW_SCHEDULED_SUBJECT = "Interview Scheduled for Your Application";

// Interview Completed
export function generateExaminerInterviewCompletedEmail(params: { firstName: string; lastName: string }): string {
  const template = loadTemplate("examiner-interview-completed");
  return renderTemplate(template, params);
}

export const EXAMINER_INTERVIEW_COMPLETED_SUBJECT = "Interview Completed - Application Update";

// Contract Sent
export function generateExaminerContractSentEmail(params: { 
  firstName: string;
  lastName: string;
  contractSigningLink: string;
}): string {
  const template = loadTemplate("examiner-contract-sent");
  return renderTemplate(template, params);
}

export const EXAMINER_CONTRACT_SENT_SUBJECT = "Sign Your Independent Medical Examiner Agreement";

// Contract Signed (Admin confirmed)
export function generateExaminerContractSignedEmail(params: { firstName: string; lastName: string }): string {
  const template = loadTemplate("examiner-contract-signed");
  return renderTemplate(template, params);
}

export const EXAMINER_CONTRACT_SIGNED_SUBJECT = "Contract Confirmed - Final Approval Pending";

