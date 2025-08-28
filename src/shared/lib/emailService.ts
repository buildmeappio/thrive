import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';

const emailConfig: EmailConfig = {
  oauth: {
    email: process.env.OAUTH_USERNAME ?? '',
    clientId: process.env.OAUTH_CLIENT_ID ?? '',
    clientSecret: process.env.OAUTH_CLIENT_SECRET ?? '',
    refreshToken: process.env.OAUTH_REFRESH_TOKEN ?? '',
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
    });
  }

  private async loadTemplate(templateName: string): Promise<string> {
    const templatesDir = path.join(process.cwd(), 'src', 'templates');
    const templatePath = path.join(templatesDir, templateName);

    try {
      return await fs.readFile(templatePath, 'utf-8');
    } catch (err) {
      throw new Error(`Template ${templateName} not found`);
    }
  }

  private replacePlaceholders(template: string, data: Record<string, unknown>): string {
    return Object.entries(data).reduce((acc, [key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      return acc.replace(regex, String(value ?? ''));
    }, template);
  }

  async sendEmail(
    subject: string,
    templateName: string,
    data: Record<string, unknown> = {},
    to?: string
  ): Promise<{ success: true } | { success: false; error: string }> {
    try {
      const transporter = await this.createTransporter();
      const template = await this.loadTemplate(templateName);
      const htmlContent = this.replacePlaceholders(template, data);

      await transporter.sendMail({
        from: this.config.oauth.email,
        to: to,
        subject,
        html: htmlContent,
      });

      console.log(`✅ Email sent to ${to}`);
      return { success: true };
    } catch (err) {
      console.error('❌ Error sending email:', err);
      return { success: false, error: (err as Error).message };
    }
  }
}

const emailService = new EmailService(emailConfig);

export default emailService;
