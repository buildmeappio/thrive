import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { ENV } from '@/constants/variables';
import logger from '@/utils/logger';
import prisma from '@/lib/db';

const emailConfig: EmailConfig = {
  oauth: {
    email: ENV.OAUTH_USERNAME ?? '',
    clientId: ENV.OAUTH_CLIENT_ID ?? '',
    clientSecret: ENV.OAUTH_CLIENT_SECRET ?? '',
    refreshToken: ENV.OAUTH_REFRESH_TOKEN ?? '',
  },
};

interface EmailConfig {
  oauth: {
    email: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
}

class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  private async createTransporter() {
    const { clientId, clientSecret, refreshToken } = this.config.oauth;

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    // Always fetch fresh token
    const { token } = await oauth2Client.getAccessToken();

    if (!token) {
      throw new Error('Failed to fetch access token from Google OAuth2');
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.config.oauth.email,
        clientId,
        clientSecret,
        refreshToken,
        accessToken: token,
      },
    } as any);
  }

  private async loadTemplate(templateName: string): Promise<string> {
    const templatesDir = path.join(process.cwd(), 'templates', 'emails');
    const templatePath = path.join(templatesDir, templateName);

    try {
      return await fs.readFile(templatePath, 'utf-8');
    } catch (err) {
      logger.log('Error loading email template:', err);
      throw new Error(`Template ${templateName} not found`);
    }
  }

  private replacePlaceholders(template: string, data: Record<string, unknown>): string {
    let result = template;

    // Handle Handlebars conditionals: {{#if variableName}}...{{/if}}
    const ifBlockRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    result = result.replace(ifBlockRegex, (match, variableName, content) => {
      const value = data[variableName];
      // If variable is truthy, include the content; otherwise, remove it
      if (value && (value === true || value === 'true' || String(value).toLowerCase() === 'true')) {
        return content;
      }
      return '';
    });

    // Replace simple placeholders: {{variableName}}
    result = Object.entries(data).reduce((acc, [key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      return acc.replace(regex, String(value ?? ''));
    }, result);

    return result;
  }

  private normalizeTemplateKey(templateName: string): string {
    return templateName.endsWith('.html') ? templateName.slice(0, -'.html'.length) : templateName;
  }

  private withDefaultEmailVars(data: Record<string, unknown>) {
    return {
      CDN_URL: data.CDN_URL ?? ENV.NEXT_PUBLIC_CDN_URL ?? ENV.NEXT_PUBLIC_APP_URL ?? '',
      ...data,
    };
  }

  private async loadDbTemplateIfActive(templateName: string): Promise<{
    subject: string;
    html: string;
  } | null> {
    const key = this.normalizeTemplateKey(templateName);
    try {
      const template = await prisma.emailTemplate.findFirst({
        where: { key, isActive: true, deletedAt: null },
        include: { currentVersion: true },
      });
      if (!template?.currentVersion) return null;
      return {
        subject: template.currentVersion.subject,
        html: template.currentVersion.bodyHtml,
      };
    } catch (err) {
      logger.error('Failed to load DB email template, falling back:', err);
      return null;
    }
  }

  async sendEmail(
    subject: string,
    templateName: string,
    data: Record<string, unknown> = {},
    to?: string
  ): Promise<{ success: true } | { success: false; error: string }> {
    try {
      const transporter = await this.createTransporter();
      const dataWithDefaults = this.withDefaultEmailVars(data);

      const dbTemplate = await this.loadDbTemplateIfActive(templateName);
      const rawHtml = dbTemplate ? dbTemplate.html : await this.loadTemplate(templateName);

      const rawSubject = dbTemplate ? dbTemplate.subject : subject;

      const htmlContent = this.replacePlaceholders(rawHtml, dataWithDefaults);
      const subjectContent = this.replacePlaceholders(rawSubject, dataWithDefaults);

      await transporter.sendMail({
        from: this.config.oauth.email,
        to: to,
        subject: subjectContent,
        html: htmlContent,
      });

      logger.log(`✅ Email sent to ${to}`);
      return { success: true };
    } catch (err) {
      logger.error('❌ Error sending email:', err);
      return { success: false, error: (err as Error).message };
    }
  }
}

const emailService = new EmailService(emailConfig);

export default emailService;
