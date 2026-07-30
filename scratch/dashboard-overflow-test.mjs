// Playwright overflow/interactivity test for the Dashboard component.
// Run: cd /Users/maxminhluannguyen/AuraPrep-public && node scratch/dashboard-overflow-test.mjs
import { chromium, devices } from 'playwright';

const BASE_URL = 'http://localhost:3002/dashboard-test.html';

const VIEWPORTS = [
    { name: 'iPhone SE', device: devices['iPhone SE'] },
    { name: 'iPhone 12', device: devices['iPhone 12'] },
    { name: 'iPhone 14 Pro Max', device: devices['iPhone 14 Pro Max'] },
];

const results = [];

function record(viewport, step, pass, detail) {
    results.push({ viewport, step, pass, detail });
    const status = pass ? 'PASS' : 'FAIL';
    console.log(`[${status}] (${viewport}) ${step}${detail ? ' -- ' + detail : ''}`);
}

// Checks a locator: has bbox, is within viewport (after scrolling into view),
// is not covered by another element at its center point, and can be
// force-clicked without throwing. Returns true/false.
async function checkInteractive(page, viewport, label, locator) {
    try {
        const count = await locator.count();
        if (count === 0) {
            record(viewport, `${label}: exists`, false, 'locator matched 0 elements');
            return false;
        }

        // Scroll into view (manual, per gotcha #1/#3 — avoid Playwright's
        // scrollIntoViewIfNeeded which can hang on animate-pulse elements).
        await locator.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'center' }));
        await page.waitForTimeout(50);

        const box = await locator.boundingBox();
        if (!box) {
            record(viewport, `${label}: bounding box`, false, 'no bounding box (display:none or detached)');
            return false;
        }

        const vp = page.viewportSize();
        const withinBounds =
            box.x >= -1 &&
            box.y >= -1 &&
            box.x + box.width <= vp.width + 1 &&
            box.y + box.height <= vp.height + 1;

        if (!withinBounds) {
            record(viewport, `${label}: within viewport after scroll`, false,
                `box=${JSON.stringify(box)} viewport=${JSON.stringify(vp)}`);
            return false;
        }

        // Check element at center point is this element or a descendant/ancestor of it.
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        const coverageCheck = await page.evaluate(({ x, y, selectorId }) => {
            const el = document.querySelector(`[data-harness-id="${selectorId}"]`);
            if (!el) return { ok: false, reason: 'element not found by data-harness-id' };
            const topEl = document.elementFromPoint(x, y);
            if (!topEl) return { ok: false, reason: 'elementFromPoint returned null' };
            const covered = !(el === topEl || el.contains(topEl) || topEl.contains(el));
            return {
                ok: !covered,
                reason: covered ? `center point occupied by <${topEl.tagName.toLowerCase()} class="${topEl.className}">` : 'ok',
            };
        }, { x: centerX, y: centerY, selectorId: label });

        if (!coverageCheck.ok) {
            record(viewport, `${label}: not covered at center`, false, coverageCheck.reason);
            return false;
        }

        // Force-click.
        await locator.click({ force: true, timeout: 5000 });
        record(viewport, `${label}: force-click`, true);
        return true;
    } catch (err) {
        record(viewport, `${label}: interaction`, false, `threw: ${err.message}`);
        return false;
    }
}

// Tags every currently-matching element with a unique data-harness-id so we
// can re-select it reliably from page.evaluate for the coverage check.
async function tagElements(page, selector, prefix) {
    return await page.evaluate(({ selector, prefix }) => {
        const els = Array.from(document.querySelectorAll(selector));
        const ids = [];
        els.forEach((el, i) => {
            const id = `${prefix}-${i}`;
            el.setAttribute('data-harness-id', id);
            ids.push(id);
        });
        return ids;
    }, { selector, prefix });
}

async function checkClippedContent(page, viewport) {
    // Scoped to real content containers, not decorative particle layers.
    // We look at elements that hold visible text and have overflow-hidden
    // ancestors where scrollHeight > clientHeight, ie. text is being cut off.
    const clipped = await page.evaluate(() => {
        const results = [];
        const all = document.querySelectorAll('h1,h2,h3,p,span,button,a,div');
        for (const el of all) {
            const text = (el.textContent || '').trim();
            if (!text || text.length < 2) continue;
            // Skip elements that are themselves containers of many children (likely not leaf text)
            if (el.children.length > 3) continue;
            const style = getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') continue;
            // Walk up ancestors looking for overflow-hidden clipping with scrollHeight > clientHeight
            let ancestor = el.parentElement;
            let depth = 0;
            while (ancestor && depth < 6) {
                const aStyle = getComputedStyle(ancestor);
                const hidesOverflow = aStyle.overflow === 'hidden' || aStyle.overflowY === 'hidden';
                if (hidesOverflow && ancestor.scrollHeight > ancestor.clientHeight + 2) {
                    // Skip obviously decorative layers (no meaningful class hints of particles)
                    const cls = ancestor.className && ancestor.className.toString ? ancestor.className.toString() : '';
                    if (/particle|glow|shimmer|aura-particle|decorative/i.test(cls)) {
                        ancestor = ancestor.parentElement;
                        depth++;
                        continue;
                    }
                    // Check this element itself is actually vertically clipped by ancestor bounds
                    const elRect = el.getBoundingClientRect();
                    const aRect = ancestor.getBoundingClientRect();
                    const isClipped = elRect.bottom > aRect.bottom + 1 || elRect.top < aRect.top - 1;
                    if (isClipped) {
                        results.push({
                            text: text.slice(0, 60),
                            tag: el.tagName,
                            ancestorClass: cls.slice(0, 80),
                        });
                    }
                    break;
                }
                ancestor = ancestor.parentElement;
                depth++;
            }
        }
        return results;
    });
    if (clipped.length > 0) {
        for (const c of clipped) {
            record(viewport, `content-clip-check: "${c.text}"`, false, `clipped by ancestor class="${c.ancestorClass}"`);
        }
    } else {
        record(viewport, 'content-clip-check', true, 'no clipped text content found');
    }
}

async function runForViewport(browser, viewportDef) {
    const { name, device } = viewportDef;
    const context = await browser.newContext({ ...device });
    const page = await context.newPage();

    page.on('pageerror', err => record(name, 'page error', false, err.message));
    page.on('console', msg => {
        if (msg.type() === 'error') record(name, 'console error', false, msg.text());
    });

    await page.goto(BASE_URL, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('[data-testid="harness-root"]', { timeout: 15000 });
    await page.waitForTimeout(300);

    record(name, 'harness mounted', true);

    // === Flow 1: Creature switcher buttons (collection list) ===
    await tagElements(page, '.scrollbar-hide button', 'creature-btn');
    const creatureButtons = page.locator('.scrollbar-hide button');
    const creatureCount = await creatureButtons.count();
    for (let i = 0; i < creatureCount; i++) {
        const ok = await checkInteractive(page, name, `creature-btn-${i}`, creatureButtons.nth(i));
        if (ok) {
            const logText = await page.locator('#dashboard-harness-log').textContent();
            const fired = logText && logText.includes('setActiveCreatureId');
            record(name, `creature-btn-${i}: callback fired`, !!fired, fired ? '' : 'setActiveCreatureId not observed in harness log after click');
        }
    }

    // === Flow 2: Daily mission cards ===
    // Missions are buttons with disabled attr possibly set; re-query each time
    // since order can change (sorted by completed).
    await tagElements(page, 'button', 'all-btn'); // ensure fresh tagging baseline (not used directly)
    const missionButtons = page.locator('div.grid.grid-cols-1 > button');
    const missionCount = await missionButtons.count();
    await tagElements(page, 'div.grid.grid-cols-1 > button', 'mission-btn');
    for (let i = 0; i < missionCount; i++) {
        const btn = missionButtons.nth(i);
        const isDisabled = await btn.isDisabled();
        if (isDisabled) {
            // Completed missions are legitimately disabled -- verify visible & in-bounds only, no click.
            await btn.evaluate(el => el.scrollIntoView({ block: 'center' }));
            await page.waitForTimeout(50);
            const box = await btn.boundingBox();
            record(name, `mission-btn-${i}: disabled-but-visible`, !!box, box ? '' : 'no bbox for disabled mission button');
            continue;
        }
        const ok = await checkInteractive(page, name, `mission-btn-${i}`, btn);
        if (ok) {
            const logText = await page.locator('#dashboard-harness-log').textContent();
            const fired = logText && logText.includes('startMission');
            record(name, `mission-btn-${i}: callback fired`, !!fired, fired ? '' : 'startMission not observed in harness log after click');
        }
    }

    // === Flow 3: Training / Shop action buttons ===
    const actionRow = page.locator('div.flex.gap-3.md\\:gap-4.w-full.h-auto > button');
    const actionCount = await actionRow.count();
    await tagElements(page, 'div.flex.gap-3.md\\:gap-4.w-full.h-auto > button', 'action-btn');
    for (let i = 0; i < actionCount; i++) {
        const btn = actionRow.nth(i);
        const isDisabled = await btn.isDisabled();
        if (isDisabled) {
            await btn.evaluate(el => el.scrollIntoView({ block: 'center' }));
            const box = await btn.boundingBox();
            record(name, `action-btn-${i}: disabled-but-visible`, !!box, box ? '' : 'no bbox');
            continue;
        }
        const ok = await checkInteractive(page, name, `action-btn-${i}`, btn);
        if (ok) {
            const logText = await page.locator('#dashboard-harness-log').textContent();
            const expected = i === 0 ? 'onOpenReview' : 'onOpenShop';
            const fired = logText && logText.includes(expected);
            record(name, `action-btn-${i}: callback fired (${expected})`, !!fired, fired ? '' : `${expected} not observed in harness log after click`);
        }
    }

    // === Flow 4: Profile avatar button (desktop-only "hidden lg:flex" header — expected hidden on mobile) ===
    const profileBtn = page.locator('button').filter({ has: page.locator('img[alt="Me"]') }).first();
    const profileBtnAlt = page.locator('button:has(> div.rounded-full), button.rounded-full').first();
    // Simpler: the profile button is the one whose onClick=onOpenProfile; select via structure.
    const headerProfileBtn = page.locator('div.hidden.lg\\:flex button').first();
    const headerCount = await headerProfileBtn.count();
    if (headerCount > 0) {
        const visible = await headerProfileBtn.isVisible();
        if (!visible) {
            record(name, 'profile-avatar-btn: hidden on mobile (expected, lg:flex only)', true, 'not present in mobile layout by design');
        } else {
            await tagElements(page, 'div.hidden.lg\\:flex button', 'profile-btn');
            await checkInteractive(page, name, 'profile-btn-0', headerProfileBtn);
        }
    }

    // === Flow 5: Feedback link (anchor, not button, but check clickable/reachable) ===
    const feedbackLink = page.locator('a[href*="docs.google.com/forms"]');
    if (await feedbackLink.count() > 0) {
        await feedbackLink.evaluate(el => el.scrollIntoView({ block: 'center' }));
        await page.waitForTimeout(50);
        const box = await feedbackLink.boundingBox();
        const vp = page.viewportSize();
        const withinBounds = box && box.x >= -1 && box.y >= -1 && box.x + box.width <= vp.width + 1 && box.y + box.height <= vp.height + 1;
        record(name, 'feedback-link: within viewport', !!withinBounds, box ? JSON.stringify(box) : 'no bbox');
    }

    // === Flow 6: content clipping check ===
    await checkClippedContent(page, name);

    // === Flow 7: scrollable collection panel actually scrolls to reveal all creature cards ===
    const collectionPanel = page.locator('.scrollbar-hide').first();
    if (await collectionPanel.count() > 0) {
        const scrollInfo = await collectionPanel.evaluate(el => ({
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
        }));
        if (scrollInfo.scrollHeight > scrollInfo.clientHeight + 2) {
            // Try scrolling to the bottom and confirm last creature button becomes visible & in-bounds.
            await collectionPanel.evaluate(el => { el.scrollTop = el.scrollHeight; });
            await page.waitForTimeout(100);
            const lastBtn = creatureButtons.last();
            const box = await lastBtn.boundingBox();
            const vp = page.viewportSize();
            const withinBounds = box && box.y + box.height <= vp.height + 1 && box.y >= -1;
            record(name, 'collection-panel: scroll reveals last creature', !!withinBounds, box ? JSON.stringify(box) : 'no bbox after scroll');
        } else {
            record(name, 'collection-panel: no overflow (all creatures fit)', true);
        }
    }

    await context.close();
}

(async () => {
    const browser = await chromium.launch();
    for (const vp of VIEWPORTS) {
        console.log(`\n=== Viewport: ${vp.name} ===`);
        await runForViewport(browser, vp);
    }
    await browser.close();

    const total = results.length;
    const passed = results.filter(r => r.pass).length;
    const failed = total - passed;
    console.log('\n=== SUMMARY ===');
    console.log(`Total checks: ${total}  Passed: ${passed}  Failed: ${failed}`);
    if (failed > 0) {
        console.log('\nFailures:');
        results.filter(r => !r.pass).forEach(r => {
            console.log(`  - (${r.viewport}) ${r.step}: ${r.detail}`);
        });
    }
    process.exit(failed > 0 ? 1 : 0);
})();
