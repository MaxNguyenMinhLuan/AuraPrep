/**
 * Email Service
 *
 * Handles SendGrid email sending with tracking.
 * Sends personalized Guardian emails to users.
 */

import * as sgMail from '@sendgrid/mail';

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
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string = 'guardians@auraprep.com') {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
    sgMail.setApiKey(apiKey);
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
        previewText,
        trackingData
      } = options;

      // Add tracking pixel and custom headers if we have tracking data
      const tracking = trackingData ? this.buildTrackingData(trackingData) : {};

      const msg = {
        to,
        from: this.fromEmail,
        subject,
        html: htmlContent,
        previewText: previewText || subject,
        trackingSettings: {
          clickTracking: {
            enable: true,
            enableText: true
          },
          openTracking: {
            enable: true,
            substitutionTag: '<%open_tracking_pixel%>'
          },
          subscriptionTracking: {
            enable: true,
            text: '<%preference_unsubscribe_text%>',
            html: '<a href="<%preference_unsubscribe_url%>">Unsubscribe</a>'
          }
        },
        customArgs: tracking
      };

      await sgMail.send(msg as any);
      console.log(`Email sent to ${to} (${trackingData?.nudgeLevel || 'unknown'})`);
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
      const msg = {
        to: recipientEmail,
        from: this.fromEmail,
        subject: 'AuraPrep Email Test',
        html: `<h1>Test Email</h1><p>This is a test email from AuraPrep. If you received this, the email system is working!</p>`
      };

      await sgMail.send(msg as any);
      console.log(`Test email sent to ${recipientEmail}`);
    } catch (error) {
      console.error(`Error sending test email to ${recipientEmail}:`, error);
      throw error;
    }
  }

  /**
   * Build custom args for tracking
   */
  private buildTrackingData(data: {
    userId: string;
    nudgeLevel: 'morning' | 'afternoon' | 'evening';
  }): Record<string, string> {
    return {
      userId: data.userId,
      nudgeLevel: data.nudgeLevel,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate email address
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Handle SendGrid webhook events (for later implementation)
   */
  static processWebhookEvent(event: any): void {
    // This will be implemented when we set up the webhook endpoint
    const { event: eventType, userId, nudgeLevel } = event.customArgs || {};

    switch (eventType) {
      case 'open':
        console.log(`Email opened by user ${userId}`);
        break;
      case 'click':
        console.log(`Email clicked by user ${userId}`);
        break;
      case 'unsubscribe':
        console.log(`User ${userId} unsubscribed`);
        break;
      default:
        console.log(`Unknown event: ${eventType}`);
    }
  }
}
