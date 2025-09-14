import { google } from 'googleapis';
import nodemailer, { type Transporter } from "nodemailer";

type SendArgs = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  fromName?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: { filename: string; content: Buffer | string; contentType?: string }[];
};

let transporterPromise: Promise<Transporter> | null = null;

async function createTransporter(): Promise<Transporter> {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground',
  );
  oauth2.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  const { token } = await oauth2.getAccessToken();
  if (!token) throw new Error('Failed to obtain access token');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
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
  const from = `${args.fromName ?? "Thrive"} <${process.env.GMAIL_USER}>`;
  const mail = {
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
    cc: args.cc,
    bcc: args.bcc,
    replyTo: args.replyTo,
    attachments: args.attachments,
  };

  let t = await getTransporter();
  try {
    return await t.sendMail(mail);
  } catch (err: any) {
    // If token expired or transporter got invalidated, rebuild once and retry.
    if (err?.code === "EAUTH" || err?.responseCode === 401 || err?.responseCode === 535) {
      transporterPromise = null;
      t = await getTransporter();
      return await t.sendMail(mail);
    }
    throw err;
  }
}