"use strict";
/**
 * Email Service
 *
 * Handles SendGrid email sending with tracking.
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
const sgMail = __importStar(require("@sendgrid/mail"));
class EmailService {
    constructor(apiKey, fromEmail = 'guardians@auraprep.com') {
        this.fromEmail = fromEmail;
        sgMail.setApiKey(apiKey);
    }
    /**
     * Send a Guardian nudge email
     */
    async sendNudgeEmail(options) {
        try {
            const { to, subject, htmlContent, previewText, trackingData } = options;
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
            await sgMail.send(msg);
            console.log(`Email sent to ${to} (${trackingData?.nudgeLevel || 'unknown'})`);
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
            const msg = {
                to: recipientEmail,
                from: this.fromEmail,
                subject: 'AuraPrep Email Test',
                html: `<h1>Test Email</h1><p>This is a test email from AuraPrep. If you received this, the email system is working!</p>`
            };
            await sgMail.send(msg);
            console.log(`Test email sent to ${recipientEmail}`);
        }
        catch (error) {
            console.error(`Error sending test email to ${recipientEmail}:`, error);
            throw error;
        }
    }
    /**
     * Build custom args for tracking
     */
    buildTrackingData(data) {
        return {
            userId: data.userId,
            nudgeLevel: data.nudgeLevel,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Validate email address
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * Handle SendGrid webhook events (for later implementation)
     */
    static processWebhookEvent(event) {
        // This will be implemented when we set up the webhook endpoint
        const { event: eventType, userId } = event.customArgs || {};
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
exports.EmailService = EmailService;
//# sourceMappingURL=emailService.js.map