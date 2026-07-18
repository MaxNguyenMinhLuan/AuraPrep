interface QuestionReportPayload {
    reason: string;
    questionText: string;
    subtopic: string;
    userId?: string;
    userEmail?: string;
}

const REPORT_WEBHOOK_URL = import.meta.env.VITE_REPORT_WEBHOOK_URL;

/**
 * Sends a question report to the Google Sheet via the Apps Script web app
 * bridge. Fires in the background — callers should not await UI on this.
 *
 * Uses mode: 'no-cors' with no explicit Content-Type so the request stays a
 * CORS-safelisted "simple request" and skips the preflight that Apps Script
 * web apps don't handle. This means the response is opaque (we can't read
 * success/failure from it) — that's an accepted tradeoff for a fire-and-forget
 * report.
 */
export async function reportQuestion(payload: QuestionReportPayload): Promise<void> {
    if (!REPORT_WEBHOOK_URL) {
        console.warn('[Report] VITE_REPORT_WEBHOOK_URL is not configured — report not sent.');
        return;
    }

    try {
        await fetch(REPORT_WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                reason: payload.reason,
                questionText: payload.questionText,
                subtopic: payload.subtopic,
                userId: payload.userId || 'unknown',
                userEmail: payload.userEmail || 'unknown',
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('[Report] Failed to send question report:', error);
    }
}
