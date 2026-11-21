import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.getOrThrow<string>('mail.host'),
      port: Number(this.config.get('mail.port') ?? 587),
      secure: Number(this.config.get('mail.port') ?? 587) === 465,
      auth: {
        user: this.config.getOrThrow<string>('mail.user'),
        pass: this.config.getOrThrow<string>('mail.pass'),
      },
    });
  }

  async sendVerificationEmail(to: string, firstName: string, token: string) {
    // Link goes to your frontend page, which then POSTs the token to
    // /auth/verify-email. (A GET link that verifies directly can be
    // consumed by email security scanners that pre-open links.)
    const appUrl = this.config.getOrThrow<string>('clientUrl');
    const link = `${appUrl}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: this.config.getOrThrow<string>('MAIL_FROM'),
      to,
      subject: 'Verify your email address',
      text: `Hi ${firstName},\n\nPlease verify your email by opening this link (valid for 24 hours):\n${link}\n\nIf you didn't create an account, ignore this email.`,
      html: `
        <p>Hi ${escapeHtml(firstName)},</p>
        <p>Please verify your email address (link valid for 24 hours):</p>
        <p><a href="${link}">Verify my email</a></p>
        <p>If you didn't create an account, you can ignore this email.</p>`,
    });
    this.logger.log(`Verification email sent to ${to}`);
  }
}
