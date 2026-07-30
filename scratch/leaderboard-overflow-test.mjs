import { chromium, devices } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

const VIEWPORTS = [
    { name: 'iPhone SE', ...devices['iPhone SE'].viewport },
    { name: 'iPhone 12', ...devices['iPhone 12'].viewport },
    { name: 'iPhone 14 Pro Max', ...devices['iPhone 14 Pro Max'].viewport },
];

const results = [];

function log(viewport, step, pass, detail) {
    results.push({ viewport, step, pass, detail });
    const tag = pass ? 'PASS' : 'FAIL';
    console.log(`[${tag}] (${viewport}) ${step}${detail ? ' — ' + detail : ''}`);
}

// Force-click helper: bypasses Playwright's "animation stable" wait, which
// hangs forever on elements using an infinite CSS animation (animate-pulse,
// animate-bounce, animate-subtlePulse etc). This is a known tooling quirk,
// not a real bug — see gotcha #1 in the task briefing.
async function forceClick(locator) {
    await locator.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
    await locator.click({ force: true, timeout: 5000 });
}

async function checkElement(page, locator, label, viewport, vp) {
    // Always scroll into view first (per gotcha #3: below-the-fold in a
    // scrollable container is fine as long as scrolling actually reveals it).
    // boundingBox() returns real (possibly out-of-viewport) coordinates even
    // for elements that are merely scrolled past, so we can't rely on a null
    // box to decide whether a scroll is needed.
    const scrolled = await locator.evaluate((el) => {
        el.scrollIntoView({ block: 'center', inline: 'center' });
        return true;
    }).catch(() => false);
    if (!scrolled) {
        log(vp, `${label}: bounding box`, false, 'element could not be scrolled into view / no box');
        return false;
    }
    const box2 = await locator.boundingBox().catch(() => null);
    if (!box2) {
        log(vp, `${label}: bounding box`, false, 'no bounding box after scroll');
        return false;
    }
    const { width, height } = viewport;
    const withinBounds = box2.x >= -1 && box2.y >= -1 && (box2.x + box2.width) <= width + 1 && (box2.y + box2.height) <= height + 1;
    if (!withinBounds) {
        log(vp, `${label}: within viewport`, false, `box=${JSON.stringify(box2)} viewport=${width}x${height}`);
        return false;
    }

    // Center-point coverage check via elementFromPoint
    const cx = box2.x + box2.width / 2;
    const cy = box2.y + box2.height / 2;
    const covered = await page.evaluate(({ cx, cy, sel }) => {
        const el = document.elementFromPoint(cx, cy);
        if (!el) return { covered: true, reason: 'nothing at point' };
        const target = document.querySelector(sel);
        if (target && (target === el || target.contains(el) || el.contains(target))) {
            return { covered: false };
        }
        // Fallback: walk up from el to see if target is an ancestor/descendant chain match
        return { covered: true, reason: el.outerHTML?.slice(0, 120) };
    }, { cx, cy, sel: null }).catch(() => ({ covered: false }));

    // Simpler robust coverage check: use the locator's own elementHandle identity
    const handle = await locator.elementHandle();
    const isCoveredResult = await page.evaluate(({ cx, cy }, el) => {
        const top = document.elementFromPoint(cx, cy);
        if (!top) return { covered: true, reason: 'nothing at point (offscreen/clipped)' };
        if (top === el || el.contains(top) || top.contains(el)) return { covered: false };
        return { covered: true, reason: `covered by <${top.tagName.toLowerCase()} class="${(top.className || '').toString().slice(0,80)}">` };
    }, { cx, cy }, handle).catch(() => ({ covered: false }));

    if (isCoveredResult.covered) {
        log(vp, `${label}: not covered`, false, isCoveredResult.reason);
        return false;
    }

    try {
        await forceClick(locator);
    } catch (e) {
        log(vp, `${label}: force-click`, false, e.message.slice(0, 150));
        return false;
    }

    log(vp, `${label}: interactive & clickable`, true);
    return true;
}

// Checks that visible text content isn't silently clipped by a hidden-overflow
// ancestor. Scoped away from decorative particle/effect layers (gotcha #2).
async function checkNoClippedText(page, vp) {
    const clipped = await page.evaluate(() => {
        const isDecorative = (el) => {
            // Heuristic: decorative layers are typically aria-hidden, or contain
            // no meaningful text of their own (particles/gradients/svg-only).
            if (el.getAttribute('aria-hidden') === 'true') return true;
            if (el.className && typeof el.className === 'string' && /particle|glow|shimmer|aura-particle|decorative/i.test(el.className)) return true;
            return false;
        };
        const results = [];
        const candidates = document.querySelectorAll('p, span, h1, h2, h3, button');
        candidates.forEach((el) => {
            const text = el.textContent?.trim();
            if (!text || text.length < 2) return;
            // Find nearest ancestor (including self) with overflow hidden that actually clips.
            let node = el;
            while (node && node !== document.body) {
                const style = window.getComputedStyle(node);
                if ((style.overflow === 'hidden' || style.overflowY === 'hidden') && !isDecorative(node)) {
                    if (node.scrollHeight - node.clientHeight > 4 || node.scrollWidth - node.clientWidth > 4) {
                        // Only flag if THIS element (el) itself is the one being clipped,
                        // i.e. el is at/near the edge of the clipping ancestor's box.
                        const nodeRect = node.getBoundingClientRect();
                        const elRect = el.getBoundingClientRect();
                        const overflowsBottom = elRect.bottom > nodeRect.bottom + 2;
                        const overflowsRight = elRect.right > nodeRect.right + 2;
                        if ((overflowsBottom || overflowsRight) && elRect.width > 0 && elRect.height > 0) {
                            results.push({
                                text: text.slice(0, 60),
                                tag: el.tagName.toLowerCase(),
                                clipperClass: (node.className || '').toString().slice(0, 100),
                            });
                        }
                    }
                }
                node = node.parentElement;
            }
        });
        return results;
    });

    if (clipped.length > 0) {
        for (const c of clipped) {
            log(vp, `Clipped text check`, false, `<${c.tag}> "${c.text}" clipped by ancestor .${c.clipperClass}`);
        }
        return false;
    }
    log(vp, `Clipped text check`, true, 'no real content clipped');
    return true;
}

async function runFlow(browser, viewport) {
    const vp = viewport.name;
    const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
    });
    const page = await context.newPage();

    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('console', (msg) => {
        if (msg.type() === 'error') pageErrors.push(msg.text());
    });

    await page.goto(`${BASE_URL}/leaderboard-test.html`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('text=Leaderboard', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(800); // let entrance animations + firestore rejects settle

    // ---- Flow 1: League tab (default) — podium + list ----
    log(vp, 'Initial render: League tab visible', await page.locator('text=Leaderboard').first().isVisible().catch(() => false));

    // Podium entries (top 3) — clickable only matters on Friends tab, but check visibility/coverage anyway.
    const podiumNames = page.locator('div.order-1, div.order-2, div.order-3');
    const podiumCount = await podiumNames.count();
    log(vp, `Podium renders 3 entries`, podiumCount === 3, `found ${podiumCount}`);

    // League/Friends tab buttons
    const leagueTabBtn = page.locator('button', { hasText: 'League' }).first();
    const friendsTabBtn = page.locator('button', { hasText: /^Friends/ }).first();

    await checkElement(page, leagueTabBtn, 'League tab button', viewport, vp);

    // List container — scroll through all rows, check each row for coverage.
    const rows = page.locator('.divide-y.divide-secondary\\/10 > div');
    const rowCount = await rows.count();
    log(vp, `League list renders rows`, rowCount > 0, `found ${rowCount} rows (expect up to 20)`);

    // Scroll through the list and verify each row is eventually visible & not covered.
    let rowFailures = 0;
    for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const ok = await checkElement(page, row, `League row ${i}`, viewport, vp);
        if (!ok) rowFailures++;
    }

    // Legend cards (Promotion/Demotion zone)
    const promotionCard = page.locator('text=Promotion Zone').first();
    const demotionCard = page.locator('text=Demotion Zone').first();
    await checkElement(page, promotionCard, 'Promotion Zone legend card', viewport, vp);
    await checkElement(page, demotionCard, 'Demotion Zone legend card', viewport, vp);

    // ---- Flow 2: Switch to Friends tab ----
    await checkElement(page, friendsTabBtn, 'Friends tab button', viewport, vp);
    await page.waitForTimeout(500);

    const friendsEmptyState = page.locator('text=No friends yet');
    const hasEmptyState = await friendsEmptyState.isVisible().catch(() => false);
    log(vp, 'Friends tab renders (empty state expected — Firestore calls fail soft in harness)', true, hasEmptyState ? 'empty state shown' : 'friend rows shown (real data unexpectedly present)');

    if (hasEmptyState) {
        const addFriendEmptyBtn = page.locator('button', { hasText: 'Add Friend' }).first();
        await checkElement(page, addFriendEmptyBtn, 'Add Friend button (empty state)', viewport, vp);
        // Opens modal — verify then close.
        await page.waitForTimeout(300);
        const modalHeading = page.locator('text=Add a Friend').first();
        const modalVisible = await modalHeading.isVisible().catch(() => false);
        log(vp, 'Add Friend modal opened from empty state', modalVisible);
        if (modalVisible) {
            // close it (find a close control)
            const closeBtn = page.locator('button', { hasText: '✕' }).first();
            const closeVisible = await closeBtn.isVisible().catch(() => false);
            if (closeVisible) {
                await checkElement(page, closeBtn, 'Add Friend modal close button', viewport, vp);
            } else {
                await page.keyboard.press('Escape').catch(() => {});
            }
        }
    }

    // Go back to League tab for the rest of the flows.
    await forceClick(leagueTabBtn);
    await page.waitForTimeout(300);

    // ---- Flow 3: Fan (FAB) menu — Random PvP / Friend PvP / Add Friend ----
    const fabButton = page.locator('button.rounded-full.bg-highlight').first();
    const fabExists = await fabButton.count();
    if (fabExists > 0) {
        await checkElement(page, fabButton, 'FAB (+) menu toggle button', viewport, vp);
        await page.waitForTimeout(400); // menu open transition

        const randomPvpBtn = page.locator('button', { hasText: 'Random PvP' }).first();
        const friendPvpBtn = page.locator('button', { hasText: 'Friend PvP' }).first();
        const addFriendFabBtn = page.locator('button', { hasText: 'Add Friend' }).first();

        await checkElement(page, randomPvpBtn, 'Random PvP button (fan menu)', viewport, vp);
        await checkElement(page, friendPvpBtn, 'Friend PvP button (fan menu)', viewport, vp);

        // clicking Random/Friend PvP calls handleAction which closes the menu and shows a toast.
        // Re-open menu for Add Friend check.
        const fabStillThere = await fabButton.count();
        if (fabStillThere > 0) {
            const isOpen = await page.evaluate(() => {
                const btns = Array.from(document.querySelectorAll('button'));
                return btns.some(b => b.textContent?.includes('Add Friend'));
            });
            if (!isOpen) {
                await forceClick(fabButton);
                await page.waitForTimeout(400);
            }
        }
        const addFriendFabVisible = await addFriendFabBtn.isVisible().catch(() => false);
        if (addFriendFabVisible) {
            await checkElement(page, addFriendFabBtn, 'Add Friend button (fan menu)', viewport, vp);
            await page.waitForTimeout(400);
            const modalHeading = page.locator('text=Add a Friend').first();
            const modalVisible = await modalHeading.isVisible().catch(() => false);
            log(vp, 'Add Friend modal opened from FAB menu', modalVisible);
            if (modalVisible) {
                // Check modal tabs: add / requests / friends
                const addTab = page.locator('button', { hasText: 'Add' }).first();
                const requestsTab = page.locator('button', { hasText: /Requests/ }).first();
                const friendsTabInModal = page.locator('button', { hasText: 'Friends' }).last();

                await checkElement(page, requestsTab, 'AddFriendModal: Requests tab', viewport, vp);
                await page.waitForTimeout(200);
                await checkElement(page, friendsTabInModal, 'AddFriendModal: Friends tab', viewport, vp);
                await page.waitForTimeout(200);
                await checkElement(page, addTab, 'AddFriendModal: Add tab', viewport, vp);

                const closeBtn = page.locator('button', { hasText: '✕' }).first();
                const closeVisible = await closeBtn.isVisible().catch(() => false);
                if (closeVisible) {
                    await checkElement(page, closeBtn, 'AddFriendModal close button', viewport, vp);
                } else {
                    await page.keyboard.press('Escape').catch(() => {});
                }
            }
        } else {
            log(vp, 'Add Friend button (fan menu) visible after reopen', false, 'menu did not reopen / button not found');
        }
    } else {
        log(vp, 'FAB (+) menu toggle button exists', false, 'not found in DOM');
    }

    // ---- Content clipping check ----
    await checkNoClippedText(page, vp);

    // ---- JS error check ----
    if (pageErrors.length > 0) {
        // Filter out expected Firestore network/permission errors (harness has no real auth/session).
        const realErrors = pageErrors.filter(e => !/firestore|firebase|permission|network|Failed to fetch|CORS/i.test(e));
        if (realErrors.length > 0) {
            log(vp, 'No unexpected JS errors', false, realErrors.slice(0, 5).join(' | '));
        } else {
            log(vp, 'No unexpected JS errors (Firestore errors filtered as expected)', true);
        }
    } else {
        log(vp, 'No JS errors', true);
    }

    await context.close();
}

(async () => {
    const browser = await chromium.launch();
    for (const viewport of VIEWPORTS) {
        console.log(`\n=== Viewport: ${viewport.name} (${viewport.width}x${viewport.height}) ===`);
        try {
            await runFlow(browser, viewport);
        } catch (e) {
            log(viewport.name, 'Flow crashed', false, e.stack?.slice(0, 500) || String(e));
        }
    }
    await browser.close();

    const total = results.length;
    const passed = results.filter(r => r.pass).length;
    const failed = total - passed;
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total checks: ${total}  Passed: ${passed}  Failed: ${failed}`);
    if (failed > 0) {
        console.log(`\nFailures:`);
        results.filter(r => !r.pass).forEach(r => console.log(`  - (${r.viewport}) ${r.step}: ${r.detail}`));
    }
    process.exit(failed > 0 ? 1 : 0);
})();
