/**
 * Email Service
 *
 * Handles Nodemailer email sending via Gmail SMTP.
 * Sends personalized Guardian emails to users.
 */

import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  previewText?: string;
  trackingData?: {
    userId: string;
    nudgeLevel: 'morning' | 'afternoon' | 'evening';
  };
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor(appPassword: string, fromEmail: string = 'auraprep.academy@gmail.com') {
    this.fromEmail = fromEmail;
    
    // Configure Nodemailer transporter for Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'auraprep.academy@gmail.com',
        pass: appPassword
      }
    });
  }

  /**
   * Send a Guardian nudge email
   */
  async sendNudgeEmail(options: EmailOptions): Promise<void> {
    try {
      const {
        to,
        subject,
        htmlContent,
        previewText
      } = options;

      const mailOptions = {
        from: `AuraPrep Guardians <${this.fromEmail}>`,
        to,
        subject,
        text: previewText || subject, // Fallback text for preview
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to} (${options.trackingData?.nudgeLevel || 'unknown'})`);
    } catch (error) {
      console.error(`Error sending email to ${options.to}:`, error);
      throw error;
    }
  }

  /**
   * Send test email to verify setup
   */
  async sendTestEmail(recipientEmail: string): Promise<void> {
    try {
      const mailOptions = {
        from: `AuraPrep Guardians <${this.fromEmail}>`,
        to: recipientEmail,
        subject: 'AuraPrep Email Test',
        html: `<h1>Test Email</h1><p>This is a test email from AuraPrep. If you received this, the Nodemailer Gmail integration is working perfectly!</p>`
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Test email sent to ${recipientEmail}`);
    } catch (error) {
      console.error(`Error sending test email to ${recipientEmail}:`, error);
      throw error;
    }
  }

  /**
   * Validate email address
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
