"use strict";
/**
 * Email Service
 *
 * Handles Nodemailer email sending via Gmail SMTP.
 * Sends personalized Guardian emails to users.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer = __importStar(require("nodemailer"));
class EmailService {
    constructor(appPassword, fromEmail = 'auraprep.academy@gmail.com') {
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
    async sendNudgeEmail(options) {
        try {
            const { to, subject, htmlContent, previewText } = options;
            const mailOptions = {
                from: `AuraPrep Guardians <${this.fromEmail}>`,
                to,
                subject,
                text: previewText || subject, // Fallback text for preview
                html: htmlContent
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`Email sent to ${to} (${options.trackingData?.nudgeLevel || 'unknown'})`);
        }
        catch (error) {
            console.error(`Error sending email to ${options.to}:`, error);
            throw error;
        }
    }
    /**
     * Send test email to verify setup
     */
    async sendTestEmail(recipientEmail) {
        try {
            const mailOptions = {
                from: `AuraPrep Guardians <${this.fromEmail}>`,
                to: recipientEmail,
                subject: 'AuraPrep Email Test',
                html: `<h1>Test Email</h1><p>This is a test email from AuraPrep. If you received this, the Nodemailer Gmail integration is working perfectly!</p>`
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`Test email sent to ${recipientEmail}`);
        }
        catch (error) {
            console.error(`Error sending test email to ${recipientEmail}:`, error);
            throw error;
        }
    }
    /**
     * Validate email address
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=emailService.js.map