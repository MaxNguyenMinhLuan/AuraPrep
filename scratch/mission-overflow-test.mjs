// Playwright overflow/interaction harness for MissionView.
// Run: cd /Users/maxminhluannguyen/AuraPrep-public && node scratch/mission-overflow-test.mjs
import { chromium, devices } from 'playwright';

const BASE_URL = 'http://localhost:3002/mission-test.html';

const VIEWPORTS = [
    { name: 'iPhone SE', device: devices['iPhone SE'] },
    { name: 'iPhone 12', device: devices['iPhone 12'] },
    { name: 'iPhone 14 Pro Max', device: devices['iPhone 14 Pro Max'] },
];

const results = [];

function record(viewport, step, pass, detail) {
    results.push({ viewport, step, pass, detail });
    const tag = pass ? 'PASS' : 'FAIL';
    console.log(`[${tag}] (${viewport}) ${step}${detail ? ' — ' + detail : ''}`);
}

// Scroll an element into view via evaluate (per gotcha #1/#3 — avoid
// Playwright's own scrollIntoViewIfNeeded which can hang on animated els).
async function scrollIntoView(locator) {
    await locator.evaluate(el => el.scrollIntoView({ block: 'center' }));
}

async function isFullyInViewport(page, locator) {
    const box = await locator.boundingBox();
    if (!box) return { ok: false, reason: 'no bounding box' };
    const viewport = page.viewportSize();
    const withinX = box.x >= -0.5 && box.x + box.width <= viewport.width + 0.5;
    const withinY = box.y >= -0.5 && box.y + box.height <= viewport.height + 0.5;
    if (!withinX || !withinY) {
        return { ok: false, reason: `box=${JSON.stringify(box)} viewport=${JSON.stringify(viewport)}` };
    }
    return { ok: true, box };
}

async function isCoveredAtCenter(page, locator, box) {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const result = await page.evaluate(({ cx, cy }) => {
        const topEl = document.elementFromPoint(cx, cy);
        if (!topEl) return { covered: true, reason: 'no element at point (offscreen?)' };
        return { covered: false, tag: topEl.tagName, cls: topEl.className?.toString().slice(0, 80) };
    }, { cx, cy });
    return result;
}

async function checkAndClick(page, viewport, label, locator, { force = true } = {}) {
    try {
        const count = await locator.count();
        if (count === 0) {
            record(viewport, `${label}: exists`, false, 'locator matched 0 elements');
            return false;
        }
        await scrollIntoView(locator.first());
        await page.waitForTimeout(120);
        const viewCheck = await isFullyInViewport(page, locator.first());
        if (!viewCheck.ok) {
            record(viewport, `${label}: within viewport after scroll`, false, viewCheck.reason);
            return false;
        }
        const coverCheck = await isCoveredAtCenter(page, locator.first(), viewCheck.box);
        // Determine if the element at point IS the target (or a descendant/ancestor of it).
        const isSelfOrDescendant = await locator.first().evaluate((el, info) => {
            const pt = document.elementFromPoint(info.cx, info.cy);
            if (!pt) return false;
            return el.contains(pt) || pt.contains(el);
        }, { cx: viewCheck.box.x + viewCheck.box.width / 2, cy: viewCheck.box.y + viewCheck.box.height / 2 });
        if (!isSelfOrDescendant) {
            record(viewport, `${label}: not covered`, false, `element at center point is ${coverCheck.tag}.${coverCheck.cls}`);
            return false;
        }
        await locator.first().click({ force });
        record(viewport, `${label}: click`, true);
        return true;
    } catch (err) {
        record(viewport, `${label}: click`, false, String(err).slice(0, 200));
        return false;
    }
}

// Checks that no real content (message/question text) is clipped by a
// hidden-overflow ancestor. Skips elements that look like decorative
// particle layers (per gotcha #2).
async function checkClippedContent(page, viewport, contextLabel) {
    const clipped = await page.evaluate(() => {
        const results = [];
        const all = document.querySelectorAll('body *');
        for (const el of all) {
            const style = getComputedStyle(el);
            const isHiddenOverflow = style.overflow === 'hidden' || style.overflowY === 'hidden';
            if (!isHiddenOverflow) continue;
            // Skip likely decorative/particle layers.
            const cls = el.className?.toString() || '';
            if (/particle|shimmer|glow|aura-particle|decor|bg-|overlay/i.test(cls) && !/prose|content|question|passage|answer/i.test(cls)) {
                continue;
            }
            // Only care about elements that actually contain meaningful text.
            const text = el.textContent?.trim() || '';
            if (text.length < 20) continue;
            if (el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 0) {
                // Allow explicitly-scrollable content panels (passage/notes boxes use
                // max-h + overflow-y-auto by design — that's scrollable, not clipped).
                if (style.overflowY === 'auto' || style.overflowY === 'scroll') continue;
                results.push({
                    tag: el.tagName,
                    cls: cls.slice(0, 100),
                    scrollHeight: el.scrollHeight,
                    clientHeight: el.clientHeight,
                    textSample: text.slice(0, 60),
                });
            }
        }
        return results;
    });
    if (clipped.length === 0) {
        record(viewport, `${contextLabel}: no clipped content text`, true);
    } else {
        for (const c of clipped) {
            record(viewport, `${contextLabel}: clipped content check`, false,
                `<${c.tag} class="${c.cls}"> scrollHeight=${c.scrollHeight} clientHeight=${c.clientHeight} text="${c.textSample}..."`);
        }
    }
}

async function answerQuestion(page, viewport, correct) {
    // Read current question's answerIndex is not directly accessible from DOM,
    // so we click option A (index 0) by default for "correct" only on Q1 (known
    // to be answerIndex 3)... instead, more robustly: find the button whose
    // click leads to a "Streak Maintained!" vs use data structure knowledge.
    // Simpler + robust: click a specific lettered option based on `correct`
    // using known answer key order from the harness mock (0,3,2,2,3).
    throw new Error('unused');
}

const ANSWER_KEY = [3, 0, 2, 2, 3]; // must mirror QUESTIONS[].answerIndex in missionTestEntry.tsx

async function clickOption(page, viewport, index, label) {
    const options = page.locator('button').filter({ hasText: /^[A-D]\./ });
    // AnswerChoices renders letter inline; use a more robust selector via role.
    const btn = page.getByRole('button').filter({ hasText: new RegExp(`^${String.fromCharCode(65 + index)}\\.`) });
    return checkAndClick(page, viewport, label, btn);
}

async function runFlow(browser, viewportDef) {
    const { name, device } = viewportDef;
    const context = await browser.newContext({ ...device });
    const page = await context.newPage();
    page.on('pageerror', err => record(name, 'page error', false, String(err).slice(0, 200)));
    page.on('console', msg => {
        if (msg.type() === 'error') record(name, 'console error', false, msg.text().slice(0, 200));
    });

    await page.goto(BASE_URL, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('#root', { timeout: 15000 });
    await page.waitForTimeout(500);

    // Sanity: mission content mounted.
    const questionVisible = await page.locator('text=Current Streak:').count();
    record(name, 'mount: MissionView rendered', questionVisible > 0, questionVisible === 0 ? 'no "Current Streak" text found' : undefined);
    if (questionVisible === 0) {
        await context.close();
        return;
    }

    // --- Flow 1: Back button reachable & clickable ---
    const backBtn = page.getByRole('button', { name: /Back/ });
    await checkAndClick(page, name, 'Back button', backBtn, { force: true });
    // Back button calls onExit which just logs in harness — no navigation, so continue.

    // --- Flow 2: Check long-stem question overflow BEFORE answering Q1 ---
    // First answer Q1 correctly (answerIndex 3) to reach Q2 (the long-stem one).
    await clickOption(page, name, ANSWER_KEY[0], 'Q1 correct answer (D)');
    await page.waitForTimeout(400);
    const nextBtn1 = page.getByRole('button', { name: /Next Challenge/ });
    await checkAndClick(page, name, 'Q1 result: Next Challenge button', nextBtn1);
    await page.waitForTimeout(400);

    // Now on Q2 — the long stem / passage question. Check for clipped content.
    await checkClippedContent(page, name, 'Q2 (long stem) active');

    // Verify the long question text is actually present (not silently dropped).
    const longTextVisible = await page.locator('text=municipal transit expansion').count();
    record(name, 'Q2: long stem text rendered', longTextVisible > 0, longTextVisible === 0 ? 'long stem text not found in DOM' : undefined);

    // Verify passage panel (scrollable) is present and its scroll actually works.
    const passagePanel = page.locator('div.overflow-y-auto').first();
    const passageCount = await passagePanel.count();
    if (passageCount > 0) {
        await scrollIntoView(passagePanel);
        const before = await passagePanel.evaluate(el => el.scrollTop);
        await passagePanel.evaluate(el => { el.scrollTop = el.scrollHeight; });
        await page.waitForTimeout(100);
        const after = await passagePanel.evaluate(el => el.scrollTop);
        record(name, 'Q2: passage panel scrolls', after > before || after > 0, `before=${before} after=${after}`);
    } else {
        record(name, 'Q2: passage panel present', false, 'no .overflow-y-auto panel found');
    }

    // Answer Q2 correctly (answerIndex 0) to proceed.
    await clickOption(page, name, ANSWER_KEY[1], 'Q2 correct answer (A)');
    await page.waitForTimeout(400);
    const nextBtn2 = page.getByRole('button', { name: /Next Challenge/ });
    await checkAndClick(page, name, 'Q2 result: Next Challenge button', nextBtn2);
    await page.waitForTimeout(400);

    // --- Flow 3: Q3 has a graph (hasGraphic). Check it renders and doesn't clip. ---
    await checkClippedContent(page, name, 'Q3 (graph) active');
    const svgGraph = page.locator('svg').first();
    const svgCount = await svgGraph.count();
    record(name, 'Q3: graph SVG rendered', svgCount > 0, svgCount === 0 ? 'no svg found for graphData question' : undefined);

    // Answer Q3 WRONG (pick index != 2) while DOUBLE_JEOPARDY is in inventory,
    // to trigger the Double Jeopardy modal.
    const wrongIndex = ANSWER_KEY[2] === 0 ? 1 : 0;
    const wrongBtn = page.getByRole('button', { name: new RegExp(`^${String.fromCharCode(65 + wrongIndex)}\\.`) });
    await checkAndClick(page, name, 'Q3 WRONG answer (to trigger Double Jeopardy)', wrongBtn);
    await page.waitForTimeout(400);

    // --- Flow 4: Double Jeopardy modal ---
    const jeopardyModal = page.locator('text=Double Jeopardy!');
    const modalVisible = await jeopardyModal.count();
    record(name, 'Double Jeopardy modal appears', modalVisible > 0, modalVisible === 0 ? 'modal text not found after wrong answer with DOUBLE_JEOPARDY in inventory' : undefined);

    if (modalVisible > 0) {
        await checkClippedContent(page, name, 'Double Jeopardy modal open');
        const riskBtn = page.getByRole('button', { name: /RISK IT ALL/ });
        const exitBtn = page.getByRole('button', { name: /TAKE PARTIAL & EXIT/ });
        // Verify both buttons visible/clickable-in-place, but only actually
        // click RISK IT ALL to continue exercising the flow (exit would end
        // the mission and we still want to test more questions).
        const riskOk = await isFullyInViewport(page, riskBtn.first());
        record(name, 'Double Jeopardy: RISK IT ALL within viewport', riskOk.ok, riskOk.ok ? undefined : riskOk.reason);
        const exitOk = await isFullyInViewport(page, exitBtn.first());
        record(name, 'Double Jeopardy: TAKE PARTIAL & EXIT within viewport', exitOk.ok, exitOk.ok ? undefined : exitOk.reason);

        await checkAndClick(page, name, 'Double Jeopardy: RISK IT ALL click', riskBtn);
        await page.waitForTimeout(400);

        // After risking, selectedAnswer resets to null — should be back on Q3
        // (same question) with a fresh answer state. Now answer correctly.
        await clickOption(page, name, ANSWER_KEY[2], 'Q3 retry correct answer (C)');
        await page.waitForTimeout(400);
        const nextBtn3 = page.getByRole('button', { name: /Next Challenge/ });
        await checkAndClick(page, name, 'Q3 result: Next Challenge button', nextBtn3);
        await page.waitForTimeout(400);
    }

    // --- Flow 5: Report This Question modal ---
    // We should now be on Q4. Answer it (correct) to get to the result panel
    // where "Report This Question" appears.
    await clickOption(page, name, ANSWER_KEY[3], 'Q4 correct answer (C)');
    await page.waitForTimeout(400);
    const reportBtn = page.getByRole('button', { name: /Report This Question/ });
    await checkAndClick(page, name, 'Report This Question button', reportBtn);
    await page.waitForTimeout(400);

    const reportModalVisible = await page.locator('text=Report This Question').count();
    record(name, 'Report modal opens', reportModalVisible > 1, undefined); // heading + button both match text, so >1 expected once open

    // Interact with the report modal: type a reason, check Cancel button, then reopen and Submit.
    const textarea = page.locator('textarea');
    const textareaCount = await textarea.count();
    record(name, 'Report modal: textarea present', textareaCount > 0);
    if (textareaCount > 0) {
        await checkClippedContent(page, name, 'Report modal open');
        const cancelBtn = page.getByRole('button', { name: /Cancel/ });
        await checkAndClick(page, name, 'Report modal: Cancel button', cancelBtn);
        await page.waitForTimeout(300);

        // Reopen and actually submit this time.
        const reportBtn2 = page.getByRole('button', { name: /Report This Question/ });
        await checkAndClick(page, name, 'Report This Question button (reopen)', reportBtn2);
        await page.waitForTimeout(300);
        const textarea2 = page.locator('textarea');
        await textarea2.fill('Test report reason from Playwright harness.');
        const submitBtn = page.getByRole('button', { name: /^Submit$/ });
        await checkAndClick(page, name, 'Report modal: Submit button', submitBtn);
        await page.waitForTimeout(1500); // modal auto-closes after 1200ms
    }

    // Proceed: click Next Challenge to move to Q5.
    const nextBtn4 = page.getByRole('button', { name: /Next Challenge/ });
    const nextBtn4Count = await nextBtn4.count();
    if (nextBtn4Count > 0) {
        await checkAndClick(page, name, 'Q4 result: Next Challenge button', nextBtn4);
        await page.waitForTimeout(400);
    }

    // --- Flow 6: Q5 (final question) -> mission complete screen ---
    await clickOption(page, name, ANSWER_KEY[4], 'Q5 correct answer (D)');
    await page.waitForTimeout(400);
    const nextBtn5 = page.getByRole('button', { name: /Next Challenge/ });
    const nextBtn5Count = await nextBtn5.count();
    if (nextBtn5Count > 0) {
        await checkAndClick(page, name, 'Q5 result: Next Challenge button', nextBtn5);
        await page.waitForTimeout(500);
    }

    const completeHeading = page.locator('text=Complete!');
    const completeVisible = await completeHeading.count();
    record(name, 'Mission complete screen appears', completeVisible > 0, completeVisible === 0 ? 'no "Complete!" heading found after 5th correct answer' : undefined);

    if (completeVisible > 0) {
        await checkClippedContent(page, name, 'Mission complete screen');
        const returnBtn = page.getByRole('button', { name: /Return to Dashboard/ });
        await checkAndClick(page, name, 'Return to Dashboard button', returnBtn);
    }

    // --- Flow 7: streak-break path (reset mission, answer wrong w/o jeopardy) ---
    await context.close();
}

async function runStreakBreakFlow(browser, viewportDef) {
    const { name, device } = viewportDef;
    const context = await browser.newContext({ ...device });
    const page = await context.newPage();
    page.on('pageerror', err => record(name, 'page error (streak-break flow)', false, String(err).slice(0, 200)));

    await page.goto(BASE_URL, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('#root', { timeout: 15000 });
    await page.waitForTimeout(500);

    // Deplete DOUBLE_JEOPARDY inventory by resetting is not possible via UI directly,
    // so instead: exhaust the 2 DOUBLE_JEOPARDY charges via two wrong answers +
    // "TAKE PARTIAL & EXIT" is destructive (completes mission), so instead we
    // RISK IT ALL twice (consumes 1 charge each time) then get a 3rd wrong
    // answer with 0 DOUBLE_JEOPARDY left, which should show the real
    // "Streak Broken!" panel instead of the modal.

    for (let i = 0; i < 2; i++) {
        const wrongBtn = page.getByRole('button', { name: /^A\./ });
        await checkAndClick(page, name, `Streak-break setup: wrong answer #${i + 1} (consume Double Jeopardy)`, wrongBtn);
        await page.waitForTimeout(400);
        const modalVisible = await page.locator('text=Double Jeopardy!').count();
        if (modalVisible === 0) {
            record(name, `Streak-break setup: Double Jeopardy modal on attempt ${i + 1}`, false, 'expected modal, none found');
            break;
        }
        const riskBtn = page.getByRole('button', { name: /RISK IT ALL/ });
        await checkAndClick(page, name, `Streak-break setup: RISK IT ALL #${i + 1}`, riskBtn);
        await page.waitForTimeout(400);
    }

    // Now inventory should have 0 DOUBLE_JEOPARDY. Answer wrong again — expect
    // the direct "Streak Broken!" panel (isCorrect === false, no modal).
    const wrongBtnFinal = page.getByRole('button', { name: /^A\./ });
    await checkAndClick(page, name, 'Final wrong answer (no Double Jeopardy left)', wrongBtnFinal);
    await page.waitForTimeout(400);

    const modalVisibleFinal = await page.locator('text=Double Jeopardy!').count();
    record(name, 'No Double Jeopardy modal once inventory exhausted', modalVisibleFinal === 0, modalVisibleFinal > 0 ? 'modal still appeared with 0 DOUBLE_JEOPARDY inventory' : undefined);

    const streakBrokenVisible = await page.locator('text=Streak Broken!').count();
    record(name, '"Streak Broken!" panel appears', streakBrokenVisible > 0, streakBrokenVisible === 0 ? 'no Streak Broken panel found' : undefined);

    if (streakBrokenVisible > 0) {
        await checkClippedContent(page, name, 'Streak Broken panel');
        const tryAgainBtn = page.getByRole('button', { name: /Try Again From Start/ });
        await checkAndClick(page, name, '"Try Again From Start" button', tryAgainBtn);
        await page.waitForTimeout(400);

        // Progress should now be back to 0.
        const streakText = await page.locator('text=/Current Streak: 0/').count();
        record(name, 'Progress resets to 0 after streak break', streakText > 0, streakText === 0 ? 'Current Streak: 0 not found after Try Again' : undefined);
    }

    await context.close();
}

(async () => {
    const browser = await chromium.launch();
    try {
        for (const vp of VIEWPORTS) {
            console.log(`\n=== Viewport: ${vp.name} (${vp.device.viewport.width}x${vp.device.viewport.height}) — main flow ===`);
            await runFlow(browser, vp);
            console.log(`\n=== Viewport: ${vp.name} — streak-break / Double-Jeopardy-exhaustion flow ===`);
            await runStreakBreakFlow(browser, vp);
        }
    } finally {
        await browser.close();
    }

    const total = results.length;
    const passed = results.filter(r => r.pass).length;
    const failed = total - passed;
    console.log('\n========== SUMMARY ==========');
    console.log(`Total checks: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    if (failed > 0) {
        console.log('\nFailures:');
        for (const r of results.filter(r => !r.pass)) {
            console.log(`  [${r.viewport}] ${r.step} — ${r.detail || ''}`);
        }
    }
    process.exit(failed > 0 ? 1 : 0);
})();
