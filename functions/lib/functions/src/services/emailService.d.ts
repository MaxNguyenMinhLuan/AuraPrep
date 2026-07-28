/**
 * Email Service
 *
 * Handles Nodemailer email sending via Gmail SMTP.
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
    private transporter;
    private fromEmail;
    constructor(appPassword: string, fromEmail?: string);
    /**
     * Send a Guardian nudge email
     */
    sendNudgeEmail(options: EmailOptions): Promise<void>;
    /**
     * Send test email to verify setup
     */
    sendTestEmail(recipientEmail: string): Promise<void>;
    /**
     * Validate email address
     */
    static isValidEmail(email: string): boolean;
}
export {};
//# sourceMappingURL=emailService.d.ts.map