// Throwaway Playwright overflow/interaction test for ShopView.
// Run: cd /Users/maxminhluannguyen/AuraPrep-public && node scratch/shop-overflow-test.mjs
import { chromium, devices } from 'playwright';

const URL = 'http://localhost:3002/shop-test.html';

const VIEWPORTS = [
    { name: 'iPhone SE', device: devices['iPhone SE'] },
    { name: 'iPhone 12', device: devices['iPhone 12'] },
    { name: 'iPhone 14 Pro Max', device: devices['iPhone 14 Pro Max'] },
];

let totalPass = 0;
let totalFail = 0;
const failures = [];

function log(viewport, step, ok, detail) {
    const status = ok ? 'PASS' : 'FAIL';
    if (ok) totalPass++; else { totalFail++; failures.push({ viewport, step, detail }); }
    console.log(`[${status}] (${viewport}) ${step}${detail ? ' — ' + detail : ''}`);
}

async function elementIsCoveredAtCenter(handle) {
    return await handle.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        if (cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight) {
            return { covered: false, offscreen: true, topTag: null };
        }
        const topEl = document.elementFromPoint(cx, cy);
        if (!topEl) return { covered: true, offscreen: false, topTag: 'none' };
        const covered = !(el === topEl || el.contains(topEl) || topEl.contains(el));
        return { covered, offscreen: false, topTag: topEl.tagName + (topEl.className ? '.' + String(topEl.className).split(' ').slice(0,2).join('.') : '') };
    });
}

async function checkClippedText(page, viewportName, stepLabel) {
    // Find elements whose scrollHeight/scrollWidth exceeds clientHeight/clientWidth
    // with overflow hidden, that contain direct meaningful text (not decorative).
    const clipped = await page.evaluate(() => {
        const results = [];
        const all = document.querySelectorAll('*');
        for (const el of all) {
            const style = getComputedStyle(el);
            const hidesOverflowY = style.overflowY === 'hidden' || style.overflow === 'hidden';
            const hidesOverflowX = style.overflowX === 'hidden' || style.overflow === 'hidden';
            if (!hidesOverflowY && !hidesOverflowX) continue;
            const text = (el.textContent || '').trim();
            if (text.length < 2) continue;
            // Only care about elements with direct text nodes (real content), not
            // decorative wrapper divs whose text comes from deeply nested icons/particles.
            const hasDirectText = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
            if (!hasDirectText) continue;
            const clippedY = hidesOverflowY && el.scrollHeight > el.clientHeight + 2;
            const clippedX = hidesOverflowX && el.scrollWidth > el.clientWidth + 2;
            if (clippedY || clippedX) {
                results.push({
                    tag: el.tagName,
                    cls: String(el.className).slice(0, 80),
                    text: text.slice(0, 60),
                    clippedY, clippedX,
                    scrollHeight: el.scrollHeight, clientHeight: el.clientHeight,
                    scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
                });
            }
        }
        return results;
    });
    if (clipped.length === 0) {
        log(viewportName, `${stepLabel}: text-clipping scan`, true);
    } else {
        for (const c of clipped) {
            log(viewportName, `${stepLabel}: text-clipping scan`, false,
                `<${c.tag} class="${c.cls}"> text="${c.text}" scrollH=${c.scrollHeight}/clientH=${c.clientHeight} scrollW=${c.scrollWidth}/clientW=${c.clientWidth}`);
        }
    }
}

async function testInteractiveElement(page, viewportName, stepLabel, handle, labelForLog) {
    // Scroll into view (manual, per gotcha #1/#3)
    await handle.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(50);

    const box = await handle.boundingBox();
    if (!box) {
        log(viewportName, `${stepLabel}: ${labelForLog} has bounding box`, false, 'no bounding box (display:none or detached)');
        return false;
    }
    log(viewportName, `${stepLabel}: ${labelForLog} has bounding box`, true, `${Math.round(box.width)}x${Math.round(box.height)} @ (${Math.round(box.x)},${Math.round(box.y)})`);

    const viewportSize = page.viewportSize();
    const withinBounds = box.x >= -1 && box.y >= -1 &&
        (box.x + box.width) <= viewportSize.width + 1 &&
        (box.y + box.height) <= viewportSize.height + 1;
    log(viewportName, `${stepLabel}: ${labelForLog} within viewport bounds after scroll`, withinBounds,
        withinBounds ? '' : `box=${JSON.stringify(box)} viewport=${JSON.stringify(viewportSize)}`);

    const coverage = await elementIsCoveredAtCenter(handle);
    if (coverage.offscreen) {
        log(viewportName, `${stepLabel}: ${labelForLog} not covered at center`, false, 'center point offscreen even after scrollIntoView');
    } else {
        log(viewportName, `${stepLabel}: ${labelForLog} not covered at center`, !coverage.covered,
            coverage.covered ? `topmost element at center is ${coverage.topTag}` : '');
    }

    try {
        await handle.click({ force: true, timeout: 5000 });
        log(viewportName, `${stepLabel}: ${labelForLog} force-clickable`, true);
        return true;
    } catch (e) {
        log(viewportName, `${stepLabel}: ${labelForLog} force-clickable`, false, String(e.message).split('\n')[0]);
        return false;
    }
}

async function run() {
    const browser = await chromium.launch();

    for (const { name, device } of VIEWPORTS) {
        const context = await browser.newContext({ ...device });
        const page = await context.newPage();
        page.on('pageerror', (err) => log(name, 'page error', false, err.message));
        page.on('console', (msg) => {
            if (msg.type() === 'error') log(name, 'console error', false, msg.text());
        });

        await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
        await page.waitForSelector('text=Item Shop', { timeout: 15000 });
        await page.waitForTimeout(300); // let fadeIn/scaleIn animations settle a bit

        // --- Step 1: initial clipping scan ---
        await checkClippedText(page, name, 'initial');

        // --- Step 2: locate all "Buy"-style item buttons (price buttons in cards) ---
        // Each power-up card has a button with the cost + Aura icon; grab by structure.
        const buyButtons = await page.locator('div.grid > div.bg-surface button').all();
        log(name, 'discover buy buttons', buyButtons.length === 5, `found ${buyButtons.length} (expected 5)`);

        // Determine which are disabled (can't-afford) vs enabled up front, for reporting.
        for (let i = 0; i < buyButtons.length; i++) {
            const btn = buyButtons[i];
            const disabled = await btn.getAttribute('disabled');
            const cardName = await btn.evaluate((el) => {
                const card = el.closest('div.bg-surface');
                return card ? card.querySelector('h3')?.textContent : null;
            });
            const label = `Buy button #${i} (${cardName || '?'}) [${disabled !== null ? 'disabled/cant-afford' : 'enabled/can-afford'}]`;

            const ok = await testInteractiveElement(page, name, 'buy-buttons', btn, label);

            if (disabled !== null) {
                // Disabled button should NOT open the confirm modal even if force-clicked.
                const modalOpen = await page.locator('text=Confirm Purchase').count();
                log(name, `buy-buttons: ${label} correctly did not open modal (disabled)`, modalOpen === 0,
                    modalOpen > 0 ? 'modal opened despite disabled state' : '');
                continue;
            }

            // Enabled: clicking should open the confirmation modal.
            const modalVisible = await page.locator('text=Confirm Purchase').isVisible().catch(() => false);
            log(name, `buy-buttons: ${label} opened confirm modal`, modalVisible);

            if (modalVisible) {
                // Test Cancel button in modal.
                const cancelBtn = page.locator('button:has-text("Cancel")');
                await testInteractiveElement(page, name, 'confirm-modal', cancelBtn, 'Cancel button');
                const modalGoneAfterCancel = !(await page.locator('text=Confirm Purchase').isVisible().catch(() => false));
                log(name, 'confirm-modal: modal closed after Cancel', modalGoneAfterCancel);

                // Re-open and test Buy Item (confirm) button this time.
                await testInteractiveElement(page, name, 'buy-buttons', btn, label + ' (reopen)');
                const modalVisible2 = await page.locator('text=Confirm Purchase').isVisible().catch(() => false);
                if (modalVisible2) {
                    const confirmBtn = page.locator('button:has-text("Buy Item")');
                    await testInteractiveElement(page, name, 'confirm-modal', confirmBtn, 'Buy Item (confirm) button');
                    const modalGoneAfterBuy = !(await page.locator('text=Confirm Purchase').isVisible().catch(() => false));
                    log(name, 'confirm-modal: modal closed after Buy Item', modalGoneAfterBuy);
                }
            }
        }

        // --- Step 3: back button ---
        const backBtn = page.locator('button:has-text("Back")');
        await testInteractiveElement(page, name, 'nav', backBtn, 'Back button');

        // --- Step 4: scroll the power-up grid panel fully and re-scan for clipping ---
        const grid = page.locator('div.grid.overflow-y-auto').first();
        const gridExists = await grid.count();
        if (gridExists > 0) {
            await grid.evaluate((el) => { el.scrollTop = el.scrollHeight; });
            await page.waitForTimeout(150);
            log(name, 'scroll grid panel to bottom', true);
            await checkClippedText(page, name, 'after-grid-scroll');
        }

        await context.close();
    }

    await browser.close();

    console.log('\n===== SUMMARY =====');
    console.log(`PASS: ${totalPass}  FAIL: ${totalFail}`);
    if (failures.length > 0) {
        console.log('\nFailures:');
        for (const f of failures) {
            console.log(` - (${f.viewport}) ${f.step}${f.detail ? ' — ' + f.detail : ''}`);
        }
    }
    process.exit(totalFail > 0 ? 1 : 0);
}

run().catch((e) => {
    console.error('FATAL ERROR', e);
    process.exit(2);
});
