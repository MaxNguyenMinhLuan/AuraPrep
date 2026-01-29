/**
 * Email Service
 *
 * Handles SendGrid email sending with tracking.
 * Sends personalized Guardian emails to users.
 */
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
export declare class EmailService {
    private apiKey;
    private fromEmail;
    constructor(apiKey: string, fromEmail?: string);
    /**
     * Send a Guardian nudge email
     */
    sendNudgeEmail(options: EmailOptions): Promise<void>;
    /**
     * Send test email to verify setup
     */
    sendTestEmail(recipientEmail: string): Promise<void>;
    /**
     * Build custom args for tracking
     */
    private buildTrackingData;
    /**
     * Validate email address
     */
    static isValidEmail(email: string): boolean;
    /**
     * Handle SendGrid webhook events (for later implementation)
     */
    static processWebhookEvent(event: any): void;
}
export {};
//# sourceMappingURL=emailService.d.ts.map