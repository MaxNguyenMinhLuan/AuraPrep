// Playwright overflow/soft-lock test for ReviewView, run against the
// reviewTestEntry.tsx harness at /review-test.html.
//
// Run: cd /Users/maxminhluannguyen/AuraPrep-public && node scratch/review-overflow-test.mjs
import { chromium, devices } from 'playwright';

const BASE_URL = 'http://localhost:3002/review-test.html';

const VIEWPORTS = [
    { name: 'iPhone SE', device: devices['iPhone SE'] },
    { name: 'iPhone 12', device: devices['iPhone 12'] },
    { name: 'iPhone 14 Pro Max', device: devices['iPhone 14 Pro Max'] },
];

const results = [];

function record(viewport, step, pass, detail) {
    results.push({ viewport, step, pass, detail });
    const status = pass ? 'PASS' : 'FAIL';
    console.log(`[${status}] (${viewport}) ${step}${detail ? ' — ' + detail : ''}`);
}

async function isCoveredAtCenter(page, handle) {
    return await page.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        if (rect.width === 0 || rect.height === 0) return { covered: true, reason: 'zero-size' };
        const topEl = document.elementFromPoint(cx, cy);
        if (!topEl) return { covered: true, reason: 'no-element-at-point' };
        if (el === topEl || el.contains(topEl) || topEl.contains(el)) {
            return { covered: false };
        }
        return { covered: true, reason: `covered by <${topEl.tagName.toLowerCase()} class="${topEl.className}">` };
    }, handle);
}

async function checkWithinViewportAndClickable(page, locator, viewport, label) {
    const count = await locator.count();
    if (count === 0) {
        record(viewport, `${label}: element exists`, false, 'not found in DOM');
        return false;
    }
    const handle = await locator.elementHandle();
    if (!handle) {
        record(viewport, `${label}: element exists`, false, 'no element handle');
        return false;
    }

    // Scroll into view using evaluate (per gotcha #1 — avoid Playwright's
    // scrollIntoViewIfNeeded which can hang on animate-pulse elements).
    await page.evaluate((el) => el.scrollIntoView({ block: 'center' }), handle);
    await page.waitForTimeout(150);

    const box = await locator.boundingBox();
    if (!box) {
        record(viewport, `${label}: has bounding box`, false, 'boundingBox() returned null');
        return false;
    }

    const vp = page.viewportSize();
    const withinBounds =
        box.x >= -1 &&
        box.y >= -1 &&
        box.x + box.width <= vp.width + 1 &&
        box.y + box.height <= vp.height + 1;

    if (!withinBounds) {
        record(
            viewport,
            `${label}: within viewport after scroll`,
            false,
            `box=${JSON.stringify(box)} viewport=${vp.width}x${vp.height}`
        );
        return false;
    }
    record(viewport, `${label}: within viewport after scroll`, true);

    const coverage = await isCoveredAtCenter(page, handle);
    if (coverage.covered) {
        record(viewport, `${label}: not covered at center`, false, coverage.reason);
        return false;
    }
    record(viewport, `${label}: not covered at center`, true);

    try {
        await locator.click({ force: true, timeout: 5000 });
        record(viewport, `${label}: force-clickable`, true);
    } catch (err) {
        record(viewport, `${label}: force-clickable`, false, String(err.message || err).split('\n')[0]);
        return false;
    }

    return true;
}

async function checkClippedContent(page, viewport, label) {
    // Scoped to real content containers (question stem, explanation,
    // options text) — not decorative overflow-hidden particle layers.
    const clipped = await page.evaluate(() => {
        const selectors = [
            '.font-clean', // FormattedText uses font-clean class
        ];
        const offenders = [];
        document.querySelectorAll(selectors.join(',')).forEach((el) => {
            let ancestor = el.parentElement;
            while (ancestor && ancestor !== document.body) {
                const style = getComputedStyle(ancestor);
                const clipsY = style.overflowY === 'hidden' || style.overflow === 'hidden';
                if (clipsY && ancestor.scrollHeight > ancestor.clientHeight + 2) {
                    // Only flag if this ancestor isn't an intentionally
                    // scrollable text container (those use overflow-y-auto,
                    // not hidden) — overflow:hidden + hidden content is the
                    // signature of actually-clipped text.
                    offenders.push({
                        text: el.textContent?.slice(0, 60),
                        ancestorClass: ancestor.className,
                        scrollHeight: ancestor.scrollHeight,
                        clientHeight: ancestor.clientHeight,
                    });
                }
                ancestor = ancestor.parentElement;
            }
        });
        return offenders;
    });

    if (clipped.length > 0) {
        record(viewport, `${label}: no clipped text content`, false, JSON.stringify(clipped).slice(0, 300));
    } else {
        record(viewport, `${label}: no clipped text content`, true);
    }
}

async function runFlowForViewport(browser, viewportDef) {
    const { name, device } = viewportDef;
    const context = await browser.newContext({ ...device });
    const page = await context.newPage();

    page.on('pageerror', (err) => record(name, 'page error', false, String(err)));
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const text = msg.text();
            // Ignore benign favicon/font 404s from CDN in dev harness.
            if (!/favicon|font/i.test(text)) {
                record(name, 'console error', false, text.slice(0, 200));
            }
        }
    });

    try {
        await page.goto(BASE_URL, { waitUntil: 'load', timeout: 30000 });
    } catch (err) {
        record(name, 'page load', false, String(err));
        await context.close();
        return;
    }

    // Wait for the React root to actually mount ReviewView content.
    try {
        await page.waitForSelector('text=Mistakes to Fix', { timeout: 10000 });
        record(name, 'harness mounted (ReviewView visible)', true);
    } catch {
        record(name, 'harness mounted (ReviewView visible)', false, 'ReviewView content never appeared');
        await context.close();
        return;
    }

    // ---- Flow: Question 1 (long stem/options) — answer WRONG first ----
    await checkClippedContent(page, name, 'Q1 (long) initial render');

    const exitBtn = page.locator('button:has-text("Exit")').first();
    await checkWithinViewportAndClickable(page, exitBtn, name, 'Exit button (Q1, not clicked - just verified)');
    // NOTE: we verified clickability via force-click above which does NOT
    // navigate away (no real handler side effect besides console.log), so
    // we can continue safely — ReviewView doesn't unmount on onExit itself
    // since the harness ignores the callback.

    // Re-locate answer option buttons (index 0..3) inside the question card.
    let optionButtons = page.locator('button').filter({ hasText: /^A\.|^B\.|^C\.|^D\./ });
    let optCount = await optionButtons.count();
    record(name, 'Q1: answer options rendered', optCount === 4, `found ${optCount}`);

    if (optCount === 4) {
        // Click the WRONG answer first (index 0, since answerIndex=1 is correct).
        const wrongOption = optionButtons.nth(0);
        await checkWithinViewportAndClickable(page, wrongOption, name, 'Q1: wrong answer option (A)');

        // Explanation panel should now show.
        try {
            await page.waitForSelector('text=Still Needs Practice', { timeout: 5000 });
            record(name, 'Q1: explanation panel appears after wrong answer', true);
        } catch {
            record(name, 'Q1: explanation panel appears after wrong answer', false, 'panel text not found');
        }

        await checkClippedContent(page, name, 'Q1 explanation panel (long text)');

        // Strategy tip box (Command of Evidence subtopic -> may or may not match a tip).
        const stratTip = page.locator('text=Desmos').first();
        const stratCount = await stratTip.count();
        record(name, 'Q1: strategy tip box present or absent (informational)', true, `count=${stratCount}`);

        // Report This Question button.
        const reportBtn = page.locator('button:has-text("Report This Question")');
        const reportClickOk = await checkWithinViewportAndClickable(page, reportBtn, name, 'Q1: "Report This Question" button');

        if (reportClickOk) {
            // Modal should now be open.
            try {
                await page.waitForSelector('text=Report This Question', { timeout: 5000 });
                const modalHeading = page.locator('h2:has-text("Report This Question")');
                await checkWithinViewportAndClickable(page, modalHeading, name, 'Report modal: heading visible (sanity click)');
            } catch {
                // heading click may not be meaningful; continue regardless
            }

            const textarea = page.locator('textarea[placeholder="Describe the issue..."]');
            const textareaVisible = await textarea.count();
            record(name, 'Report modal: textarea present', textareaVisible > 0);

            if (textareaVisible > 0) {
                await page.evaluate((el) => el.scrollIntoView({ block: 'center' }), await textarea.elementHandle());
                await textarea.fill('Test report reason from Playwright harness.', { force: true }).catch(async () => {
                    // fallback: click then type
                    await textarea.click({ force: true });
                    await page.keyboard.type('Test report reason from Playwright harness.');
                });

                const submitBtn = page.locator('button:has-text("Submit")');
                await checkWithinViewportAndClickable(page, submitBtn, name, 'Report modal: Submit button');

                try {
                    await page.waitForSelector('text=Thanks', { timeout: 5000 });
                    record(name, 'Report modal: success confirmation shown', true);
                } catch {
                    record(name, 'Report modal: success confirmation shown', false, 'confirmation text not found');
                }

                // Modal auto-closes after 1200ms.
                await page.waitForTimeout(1500);
                const modalStillThere = await page.locator('text=Thanks').count();
                record(name, 'Report modal: auto-closed after submit', modalStillThere === 0, `remaining=${modalStillThere}`);
            } else {
                // Close modal via cancel if textarea missing (unexpected).
                const cancelBtn = page.locator('button:has-text("Cancel")');
                if (await cancelBtn.count() > 0) {
                    await cancelBtn.click({ force: true }).catch(() => {});
                }
            }
        }

        // Now click Next to advance (after wrong answer -> moves to Q2).
        const nextBtn = page.locator('button:has-text("Next")');
        const nextCount = await nextBtn.count();
        if (nextCount > 0) {
            await checkWithinViewportAndClickable(page, nextBtn, name, 'Q1: "Next" button (advance after wrong answer)');
        } else {
            record(name, 'Q1: "Next" button present', false, 'not found — report modal may still be covering it');
        }
    }

    // ---- Flow: Question 2 (normal length) — answer CORRECT ----
    await page.waitForTimeout(500);
    await checkClippedContent(page, name, 'Q2 (normal) render');

    optionButtons = page.locator('button').filter({ hasText: /^A\.|^B\.|^C\.|^D\./ });
    optCount = await optionButtons.count();
    record(name, 'Q2: answer options rendered', optCount === 4, `found ${optCount}`);

    if (optCount === 4) {
        // Q2 mock: answerIndex=1 -> option B is correct.
        const correctOption = optionButtons.nth(1);
        await checkWithinViewportAndClickable(page, correctOption, name, 'Q2: correct answer option (B)');

        try {
            await page.waitForSelector('text=Recovered!', { timeout: 5000 });
            record(name, 'Q2: "Recovered!" panel appears after correct answer', true);
        } catch {
            record(name, 'Q2: "Recovered!" panel appears after correct answer', false, 'panel text not found');
        }

        const claimBtn = page.locator('button:has-text("Claim & Continue")');
        await checkWithinViewportAndClickable(page, claimBtn, name, 'Q2: "Claim & Continue" button');
    }

    // ---- Flow: Question 3 (should now be current, normal length) ----
    await page.waitForTimeout(500);
    await checkClippedContent(page, name, 'Q3 (normal) render');

    optionButtons = page.locator('button').filter({ hasText: /^A\.|^B\.|^C\.|^D\./ });
    optCount = await optionButtons.count();
    record(name, 'Q3: answer options rendered', optCount === 4, `found ${optCount}`);

    if (optCount === 4) {
        const wrongOption = optionButtons.nth(3); // D is wrong (answerIndex=0)
        await checkWithinViewportAndClickable(page, wrongOption, name, 'Q3: wrong answer option (D)');

        try {
            await page.waitForSelector('text=Still Needs Practice', { timeout: 5000 });
            record(name, 'Q3: explanation panel appears after wrong answer', true);
        } catch {
            record(name, 'Q3: explanation panel appears after wrong answer', false, 'panel text not found');
        }

        // Verify all 4 answer choice buttons (now disabled/dimmed) are still
        // within viewport and not overlapping each other.
        const allOptions = page.locator('button').filter({ hasText: /^A\.|^B\.|^C\.|^D\./ });
        const n = await allOptions.count();
        for (let i = 0; i < n; i++) {
            await checkWithinViewportAndClickable(page, allOptions.nth(i), name, `Q3: post-answer option ${String.fromCharCode(65 + i)} still visible/not overlapped`);
        }
    }

    // ---- Exit flow ----
    await page.waitForTimeout(300);
    const finalExitBtn = page.locator('button:has-text("Exit")').first();
    if (await finalExitBtn.count() > 0) {
        await checkWithinViewportAndClickable(page, finalExitBtn, name, 'Final: Exit button reachable/clickable');
    }

    await context.close();
}

(async () => {
    const browser = await chromium.launch();
    for (const vp of VIEWPORTS) {
        console.log(`\n=== Viewport: ${vp.name} ===`);
        await runFlowForViewport(browser, vp);
    }
    await browser.close();

    const total = results.length;
    const passed = results.filter((r) => r.pass).length;
    const failed = total - passed;

    console.log('\n\n========== SUMMARY ==========');
    console.log(`Total checks: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    if (failed > 0) {
        console.log('\nFailed checks:');
        results.filter((r) => !r.pass).forEach((r) => {
            console.log(`  - (${r.viewport}) ${r.step}${r.detail ? ' — ' + r.detail : ''}`);
        });
    }
    process.exit(failed > 0 ? 1 : 0);
})();
