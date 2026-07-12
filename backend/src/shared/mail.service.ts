import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as nodemailer from 'nodemailer';
import { createLogger } from '../../utils/logger';

const log = createLogger('MailService');

@Injectable()
export class MailService {
  private createTransport() {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground',
    );

    oAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_FROM,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      },
    } as nodemailer.TransportOptions);
  }

  async sendOtpEmail(to: string, subject: string, otp: string, body: string) {
    const transport = this.createTransport();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1f2937; margin-bottom: 8px;">AssetFlow</h2>
        <p style="color: #4b5563; font-size: 15px;">${body}</p>
        <div style="margin: 24px 0; text-align: center;">
          <span style="display: inline-block; background: #1f2937; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 8px; padding: 16px 32px; border-radius: 8px;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 13px;">This OTP is valid for a limited time. Do not share it with anyone.</p>
      </div>
    `;

    try {
      await transport.sendMail({
        from: `"AssetFlow" <${process.env.GMAIL_FROM}>`,
        to,
        subject,
        html,
      });
      log.info(`OTP email sent to ${to}`);
    } catch (error) {
      log.error(`Failed to send OTP email to ${to}`, error);
      throw error;
    }
  }
}
