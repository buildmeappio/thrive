import { google } from "googleapis";
import nodemailer, { type Transporter } from "nodemailer";
import { ENV } from "@/constants/variables";
import logger from "@/utils/logger";

type SendArgs = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  fromName?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
};

let transporterPromise: Promise<Transporter> | null = null;

async function createTransporter(): Promise<Transporter> {
  // Support both OAUTH_* and GOOGLE_*/GMAIL_* environment variable names
  const clientId = process.env.OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret =
    process.env.OAUTH_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken =
    process.env.OAUTH_REFRES_TOKEN ||
    process.env.OAUTH_REFRESH_TOKEN ||
    process.env.GMAIL_REFRESH_TOKEN;
  const user = process.env.OAUTH_USERNAME || process.env.GMAIL_USER;

  if (!clientId || !clientSecret || !refreshToken || !user) {
    throw new Error(
      "Missing required OAuth email configuration. Please check your environment variables.",
    );
  }

  const oauth2 = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground",
  );
  oauth2.setCredentials({ refresh_token: refreshToken });
  const { token } = await oauth2.getAccessToken();
  if (!token) throw new Error("Failed to obtain access token");

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: user,
      clientId: clientId,
      clientSecret: clientSecret,
      refreshToken: refreshToken,
      accessToken: token,
    },
  });
}

async function getTransporter(): Promise<Transporter> {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      const t = await createTransporter();
      await t.verify();
      return t;
    })();
  }
  return transporterPromise;
}

export async function sendMail(args: SendArgs) {
  const emailUser = process.env.OAUTH_USERNAME || process.env.GMAIL_USER;
  const from = `${args.fromName ?? "Thrive Assessment & Care"} <${emailUser}>`;

  // Generate a unique Message-ID for better deliverability
  const messageId = `<${Date.now()}-${Math.random().toString(36).substring(2, 15)}@${emailUser.split("@")[1] || "thrivenetwork.ca"}>`;

  const mail = {
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text:
      args.text ||
      args.html
        ?.replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim(), // Auto-generate text from HTML if not provided
    cc: args.cc,
    bcc: args.bcc,
    replyTo: args.replyTo || ENV.EMAIL_REPLY_TO || `support@thrivenetwork.ca`,
    attachments: args.attachments,
    headers: {
      "Message-ID": messageId,
      "X-Mailer": "Thrive Assessment & Care",
      "MIME-Version": "1.0",
      ...(args.replyTo && { "Reply-To": args.replyTo }),
    },
  };

  let t = await getTransporter();
  try {
    return await t.sendMail(mail);
  } catch (err: unknown) {
    logger.error("Error sending email:", err);
    // If token expired or transporter got invalidated, rebuild once and retry.
    if (
      (err as any)?.code === "EAUTH" ||
      (err as any)?.responseCode === 401 ||
      (err as any)?.responseCode === 535
    ) {
      transporterPromise = null;
      t = await getTransporter();
      return await t.sendMail(mail);
    }
    throw err;
  }
}
