import { chromium, devices } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

const VIEWPORTS = [
    { name: 'iPhone SE', ...devices['iPhone SE'].viewport },
    { name: 'iPhone 12', ...devices['iPhone 12'].viewport },
    { name: 'iPhone 14 Pro Max', ...devices['iPhone 14 Pro Max'].viewport },
];

// Helper: check one element (already located) for bounding box / viewport / coverage / clickability.
async function checkElement(page, viewport, locator, label, results, { skipClick = false } = {}) {
    const scrolled = await locator.evaluate((el) => {
        el.scrollIntoView({ block: 'center', inline: 'center' });
        return true;
    }).catch(() => false);

    if (!scrolled) {
        results.pass = false;
        results.issues.push(`${label}: could not be scrolled into view`);
        return false;
    }

    const box = await locator.boundingBox();
    if (!box) {
        results.pass = false;
        results.issues.push(`${label}: no bounding box (not rendered/visible)`);
        return false;
    }

    const withinViewport =
        box.x >= -1 &&
        box.y >= -1 &&
        box.x + box.width <= viewport.width + 1 &&
        box.y + box.height <= viewport.height + 1;

    if (!withinViewport) {
        results.pass = false;
        results.issues.push(
            `${label}: out of viewport bounds after scrollIntoView: x=${box.x.toFixed(1)} y=${box.y.toFixed(1)} w=${box.width.toFixed(1)} h=${box.height.toFixed(1)} vs viewport ${viewport.width}x${viewport.height}`
        );
    }

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const elHandle = await locator.elementHandle();
    const isClickable = await page.evaluate(
        ([cx, cy, elh]) => {
            const el = document.elementFromPoint(cx, cy);
            if (!el) return false;
            return el === elh || elh.contains(el) || el.contains(elh);
        },
        [centerX, centerY, elHandle]
    );

    if (!isClickable) {
        results.pass = false;
        results.issues.push(`${label}: covered by another element at center point (${centerX.toFixed(1)}, ${centerY.toFixed(1)}) — unclickable`);
    }

    if (!skipClick) {
        try {
            await locator.click({ timeout: 2000, force: true });
        } catch (err) {
            results.pass = false;
            results.issues.push(`${label}: click failed: ${err.message.split('\n')[0]}`);
        }
    }

    return true;
}

async function checkClippedText(page, results) {
    const overflowInfo = await page.evaluate(() => {
        const overflowing = [];
        // Real content selectors: card titles, lore text, stat labels, headings.
        // Skip anything inside elements that look like decorative/particle layers.
        const selectors = ['h1', 'h3', 'p', 'span', 'h2'];
        const seen = new Set();
        document.querySelectorAll(selectors.join(',')).forEach((el) => {
            const text = (el.textContent || '').trim();
            if (!text) return;
            let node = el;
            for (let i = 0; i < 3 && node; i++, node = node.parentElement) {
                const style = getComputedStyle(node);
                const isDecorative = /particle|confetti|shimmer|glow|decoration/i.test(node.className || '');
                if (
                    !isDecorative &&
                    (style.overflow === 'hidden' || style.overflowY === 'hidden') &&
                    node.scrollHeight > node.clientHeight + 2 &&
                    node.clientHeight > 0
                ) {
                    const key = node.className + node.scrollHeight;
                    if (seen.has(key)) return;
                    seen.add(key);
                    overflowing.push({
                        tag: node.tagName,
                        class: (node.className || '').toString().slice(0, 120),
                        scrollHeight: node.scrollHeight,
                        clientHeight: node.clientHeight,
                        sampleText: text.slice(0, 40),
                    });
                }
            }
        });
        return overflowing;
    });

    if (overflowInfo.length > 0) {
        results.pass = false;
        results.issues.push(`Clipped content: ${JSON.stringify(overflowInfo)}`);
    }
}

async function runFlow(browser, viewport) {
    const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
    });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    const results = { viewport: viewport.name, pass: true, issues: [], steps: [] };

    await page.goto(`${BASE_URL}/bestiary-test.html`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('text=Collection', { timeout: 15000 });
    await page.waitForTimeout(500);

    // ---- STEP 1: Team Builder tab (default) ----
    results.steps.push('team-tab-initial');
    // Team slots (6 of them, 3 filled + 3 empty), roster cards below.
    const teamSlotButtons = await page.locator('div.grid.grid-cols-3 button, div.grid.grid-cols-6 button').all();
    // More robust: select buttons inside the "Active Team" section specifically.
    const activeTeamSection = page.locator('h2:has-text("Active Team")').locator('..').locator('..');
    const slotButtons = await activeTeamSection.locator('.grid button').all();
    for (let i = 0; i < slotButtons.length; i++) {
        await checkElement(page, viewport, slotButtons[i], `team-slot-${i}`, results, { skipClick: true });
    }

    // Click one filled team slot to toggle it off (remove from team), then click again isn't needed.
    if (slotButtons.length > 0) {
        // find a filled slot (has an <img> or pixel sprite inside, i.e. not "+ Empty")
        for (const btn of slotButtons) {
            const isEmpty = await btn.locator('text=Empty').count();
            if (isEmpty === 0) {
                await checkElement(page, viewport, btn, 'team-slot-filled-toggle', results);
                break;
            }
        }
    }
    await checkClippedText(page, results);

    // Click an "empty" slot to enable team-selecting mode
    const emptySlot = activeTeamSection.locator('button:has-text("Empty")').first();
    if (await emptySlot.count()) {
        await checkElement(page, viewport, emptySlot, 'team-slot-empty-enable-select-mode', results);
        await page.waitForTimeout(300);
        // Now roster cards should be clickable to add to team. Click a roster card.
        const rosterCards = page.locator('h2:has-text("Your Auramons")').locator('..').locator('..').locator('.grid > div');
        const rosterCount = await rosterCards.count();
        if (rosterCount > 0) {
            const firstCardButton = rosterCards.nth(0).locator('button').last();
            await checkElement(page, viewport, firstCardButton, 'roster-card-add-to-team', results);
        }
        // turn off selecting mode by clicking the empty slot again if still present
        const emptySlotAgain = activeTeamSection.locator('button:has-text("Empty")').first();
        if (await emptySlotAgain.count()) {
            await checkElement(page, viewport, emptySlotAgain, 'team-slot-empty-disable-select-mode', results, { skipClick: true });
        }
    }

    // ---- STEP 2: search box ----
    results.steps.push('search-box');
    const searchBox = page.locator('input[placeholder="Search Auramons..."]');
    if (await searchBox.count()) {
        await checkElement(page, viewport, searchBox, 'search-input', results, { skipClick: true });
        await searchBox.fill('a');
        await page.waitForTimeout(200);
        await searchBox.fill('');
        await page.waitForTimeout(200);
    }

    // ---- STEP 3: favorite-star toggle on a roster card ----
    results.steps.push('favorite-star-toggle');
    const favButtons = page.locator('h2:has-text("Your Auramons")').locator('..').locator('..').locator('.grid > div button').first();
    if (await favButtons.count()) {
        await checkElement(page, viewport, favButtons, 'roster-favorite-star', results);
    }
    await checkClippedText(page, results);

    // ---- STEP 4: open detail view via roster card (not in select mode) ----
    results.steps.push('open-detail-view');
    const rosterCardOpen = page.locator('h2:has-text("Your Auramons")').locator('..').locator('..').locator('.grid > div').nth(1).locator('button').last();
    if (await rosterCardOpen.count()) {
        await checkElement(page, viewport, rosterCardOpen, 'roster-card-open-detail', results);
        await page.waitForTimeout(400);
    }

    // Verify we are in detail view
    const backButton = page.locator('button:has-text("Back to Collection")');
    if (await backButton.count()) {
        results.steps.push('detail-view-open');
        await checkClippedText(page, results);

        // Favorite toggle in detail view
        const detailFavBtn = page.locator('button[title="Add to favorites"], button[title="Remove from favorites"]');
        if (await detailFavBtn.count()) {
            await checkElement(page, viewport, detailFavBtn.first(), 'detail-favorite-toggle', results);
        }

        // Rename flow: click pencil icon
        results.steps.push('rename-modal');
        const renameBtn = page.locator('button[title="Rename Auramon"]');
        if (await renameBtn.count()) {
            await checkElement(page, viewport, renameBtn, 'detail-rename-pencil', results);
            await page.waitForTimeout(200);
            const nameInput = page.locator('input[placeholder="Enter nickname..."]');
            if (await nameInput.count()) {
                await checkElement(page, viewport, nameInput, 'rename-input', results, { skipClick: true });
                await nameInput.fill('Testy McTestFace9');
                const saveBtn = page.locator('button:has-text("Save")');
                const cancelBtn = page.locator('button:has-text("Cancel")');
                if (await cancelBtn.count()) {
                    await checkElement(page, viewport, cancelBtn, 'rename-cancel-button', results, { skipClick: true });
                }
                if (await saveBtn.count()) {
                    await checkElement(page, viewport, saveBtn, 'rename-save-button', results);
                }
                await page.waitForTimeout(200);
            }
        }
        await checkClippedText(page, results);

        // Evolve button, if present (only shows if level >= nextEvoLevel and not maxed)
        const evolveBtn = page.locator('button:has-text("Evolve to")');
        if (await evolveBtn.count()) {
            results.steps.push('evolve-button');
            await checkElement(page, viewport, evolveBtn, 'evolve-button', results);
            await page.waitForTimeout(300);
        }

        // Back to collection
        const back = page.locator('button:has-text("Back to Collection")');
        if (await back.count()) {
            await checkElement(page, viewport, back, 'back-to-collection', results);
            await page.waitForTimeout(300);
        }
    } else {
        results.pass = false;
        results.issues.push('Detail view did not open after clicking roster card');
    }

    // ---- STEP 5: open detail view for an instance WITHOUT nextEvo available (maxed / stage1 no-evo-yet) to check evolution chain rendering ----
    results.steps.push('open-detail-view-maxed');
    // Navigate back to team tab first (should already be there)
    const rosterCards2 = page.locator('h2:has-text("Your Auramons")').locator('..').locator('..').locator('.grid > div');
    const rosterCount2 = await rosterCards2.count();
    if (rosterCount2 > 2) {
        const thirdCard = rosterCards2.nth(2).locator('button').last();
        await checkElement(page, viewport, thirdCard, 'roster-card-open-detail-2', results);
        await page.waitForTimeout(400);
        await checkClippedText(page, results);
        const back2 = page.locator('button:has-text("Back to Collection")');
        if (await back2.count()) {
            await checkElement(page, viewport, back2, 'back-to-collection-2', results);
            await page.waitForTimeout(300);
        }
    }

    // ---- STEP 6: switch to Binder tab ----
    results.steps.push('binder-tab');
    const binderTabBtn = page.locator('button:has-text("Binder")');
    await checkElement(page, viewport, binderTabBtn, 'binder-tab-button', results);
    await page.waitForTimeout(400);
    await checkClippedText(page, results);

    // Click a discovered creature in the binder grid to open detail view from there
    const binderCards = page.locator('button.animate-fadeInScale');
    const binderCount = await binderCards.count();
    if (binderCount > 0) {
        await checkElement(page, viewport, binderCards.first(), 'binder-card-open-detail', results);
        await page.waitForTimeout(400);
        const back3 = page.locator('button:has-text("Back to Collection")');
        if (await back3.count()) {
            await checkElement(page, viewport, back3, 'back-to-collection-3', results);
            await page.waitForTimeout(300);
        } else {
            results.pass = false;
            results.issues.push('Binder card click did not open detail view');
        }
    }

    // Undiscovered "?" placeholders should NOT be clickable buttons (they are divs) — just verify no crash scrolling to one
    const unknownPlaceholder = page.locator('text=Unknown').first();
    if (await unknownPlaceholder.count()) {
        results.steps.push('binder-unknown-placeholder-visible');
        const scrolled = await unknownPlaceholder.evaluate((el) => {
            el.scrollIntoView({ block: 'center' });
            return true;
        }).catch(() => false);
        if (!scrolled) {
            results.pass = false;
            results.issues.push('Unknown placeholder could not be scrolled into view');
        }
    }

    // Back to Team tab
    results.steps.push('team-tab-return');
    const teamTabBtn = page.locator('button:has-text("Team Builder")');
    await checkElement(page, viewport, teamTabBtn, 'team-tab-button-return', results);
    await page.waitForTimeout(300);

    if (consoleErrors.length) {
        results.pass = false;
        results.issues.push(`JS errors: ${consoleErrors.join('; ')}`);
    }

    await context.close();
    return results;
}

async function main() {
    const browser = await chromium.launch();
    const allResults = [];

    for (const viewport of VIEWPORTS) {
        const result = await runFlow(browser, viewport);
        allResults.push(result);
        const status = result.pass ? 'PASS' : 'FAIL';
        console.log(`[${status}] ${viewport.name} (steps: ${result.steps.join(' -> ')})`);
        if (!result.pass) {
            result.issues.forEach((issue) => console.log(`         - ${issue}`));
        }
    }

    await browser.close();

    const failed = allResults.filter((r) => !r.pass);
    console.log(`\n${allResults.length - failed.length}/${allResults.length} viewport runs passed`);
    if (failed.length > 0) {
        console.log(`\n${failed.length} FAILURES:`);
        failed.forEach((f) => {
            console.log(`  - [${f.viewport}]`);
            f.issues.forEach((i) => console.log(`      ${i}`));
        });
        process.exit(1);
    } else {
        console.log('\nAll BestiaryView flows are fully visible and clickable on all tested iPhone viewports.');
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
