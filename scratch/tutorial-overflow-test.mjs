import { chromium, devices } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

// iPhone viewport sizes to cover: small (SE), standard, and Pro Max (largest text-safe-area risk is
// actually the *smallest* screen, but we check a spread to be thorough).
const VIEWPORTS = [
    { name: 'iPhone SE', ...devices['iPhone SE'].viewport },
    { name: 'iPhone 12', ...devices['iPhone 12'].viewport },
    { name: 'iPhone 14 Pro Max', ...devices['iPhone 14 Pro Max'].viewport },
];

async function getTestCases(browser) {
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/tutorial-test.html?case=welcome`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForFunction(() => !!window.__TUTORIAL_TEST_CASES__, { timeout: 15000 });
    const cases = await page.evaluate(() => window.__TUTORIAL_TEST_CASES__);
    await page.close();
    return cases;
}

async function testCase(browser, testCaseName, viewport) {
    const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
    });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto(`${BASE_URL}/tutorial-test.html?case=${testCaseName}`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForFunction(() => !!document.querySelector('[data-testid="harness-root"]'), { timeout: 15000 });
    // Let entrance animations settle
    await page.waitForTimeout(600);

    const result = {
        testCase: testCaseName,
        viewport: viewport.name,
        pass: true,
        issues: [],
    };

    if (consoleErrors.length) {
        result.pass = false;
        result.issues.push(`JS errors: ${consoleErrors.join('; ')}`);
    }

    // Find all buttons rendered by the dialogue (Continue/Next/etc.)
    const buttons = await page.locator('button').all();

    if (buttons.length === 0) {
        // Some cases (e.g. forced-nav with showArrow only, no button) legitimately have no button.
        result.hasButton = false;
    } else {
        result.hasButton = true;
        for (const button of buttons) {
            const text = await button.innerText().catch(() => '(no text)');

            // Real users can scroll a scrollable dialog card to reach a button below
            // the fold — that's the fix's whole point. Soft-lock = even scrolling
            // can't bring the button into a clickable position (e.g. it's inside a
            // non-scrollable ancestor, or genuinely off-tree). Plain DOM scrollIntoView
            // (not Playwright's helper) because Playwright's version waits for the
            // element to be animation-stable first, which never resolves for elements
            // using an infinite CSS animation like animate-pulse.
            const scrolled = await button.evaluate((el) => {
                el.scrollIntoView({ block: 'center', inline: 'center' });
                return true;
            }).catch(() => false);
            if (!scrolled) {
                result.pass = false;
                result.issues.push(`Button "${text}" could not be scrolled into view`);
                continue;
            }

            const box = await button.boundingBox();

            if (!box) {
                result.pass = false;
                result.issues.push(`Button "${text}" has no bounding box (not rendered/visible)`);
                continue;
            }

            // After scrolling, the button must be fully within the viewport
            const withinViewport =
                box.x >= 0 &&
                box.y >= 0 &&
                box.x + box.width <= viewport.width + 1 &&
                box.y + box.height <= viewport.height + 1;

            if (!withinViewport) {
                result.pass = false;
                result.issues.push(
                    `Button "${text}" still out of viewport bounds after scrollIntoView: x=${box.x.toFixed(1)} y=${box.y.toFixed(1)} w=${box.width.toFixed(1)} h=${box.height.toFixed(1)} vs viewport ${viewport.width}x${viewport.height}`
                );
            }

            // Check the button is actually the top-most element at its center point
            // (i.e. not covered/overlapped by the text box or another element)
            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;
            const isClickable = await page.evaluate(
                ([cx, cy, btnHandle]) => {
                    const el = document.elementFromPoint(cx, cy);
                    if (!el) return false;
                    return el === btnHandle || btnHandle.contains(el) || el.contains(btnHandle);
                },
                [centerX, centerY, await button.elementHandle()]
            );

            if (!isClickable) {
                result.pass = false;
                result.issues.push(`Button "${text}" is covered by another element at its center point (${centerX.toFixed(1)}, ${centerY.toFixed(1)}) — unclickable`);
            }

            // Real click at the button's own coordinates. force:true skips Playwright's
            // "no CSS animation in progress" stability wait, which never converges on
            // elements using an infinite animation (e.g. animate-pulse) — that's a test-
            // tooling artifact, not a real unclickability signal. Geometry/coverage/
            // viewport-bounds are already checked explicitly above.
            try {
                await button.click({ timeout: 2000, force: true });
            } catch (err) {
                result.pass = false;
                result.issues.push(`Click failed on "${text}": ${err.message.split('\n')[0]}`);
            }
        }
    }

    // Check that dialogue message text itself isn't clipped (real soft-lock signature).
    // Deliberately decorative clipping (particle effects, rounded-corner masks) uses
    // overflow-hidden by design and is excluded — only the message paragraph and its
    // direct card wrapper matter here.
    const overflowInfo = await page.evaluate(() => {
        const overflowing = [];
        document.querySelectorAll('p.whitespace-pre-line').forEach((el) => {
            let node = el;
            for (let i = 0; i < 3 && node; i++, node = node.parentElement) {
                const style = getComputedStyle(node);
                if ((style.overflow === 'hidden' || style.overflowY === 'hidden') && node.scrollHeight > node.clientHeight + 2) {
                    overflowing.push({
                        tag: node.tagName,
                        class: node.className,
                        scrollHeight: node.scrollHeight,
                        clientHeight: node.clientHeight,
                    });
                }
            }
        });
        return overflowing;
    });

    if (overflowInfo.length > 0) {
        result.pass = false;
        result.issues.push(`Clipped overflow content: ${JSON.stringify(overflowInfo)}`);
    }

    await context.close();
    return result;
}

async function main() {
    const browser = await chromium.launch();
    const cases = await getTestCases(browser);
    console.log(`Found ${cases.length} tutorial dialogue cases: ${cases.join(', ')}\n`);

    const allResults = [];
    for (const viewport of VIEWPORTS) {
        for (const testCaseName of cases) {
            const result = await testCase(browser, testCaseName, viewport);
            allResults.push(result);
            const status = result.pass ? 'PASS' : 'FAIL';
            console.log(`[${status}] ${viewport.name.padEnd(20)} ${testCaseName}`);
            if (!result.pass) {
                result.issues.forEach((issue) => console.log(`         - ${issue}`));
            }
        }
    }

    await browser.close();

    const failed = allResults.filter((r) => !r.pass);
    console.log(`\n${allResults.length - failed.length}/${allResults.length} passed`);
    if (failed.length > 0) {
        console.log(`\n${failed.length} FAILURES:`);
        failed.forEach((f) => {
            console.log(`  - [${f.viewport}] ${f.testCase}: ${f.issues.join(' | ')}`);
        });
        process.exit(1);
    } else {
        console.log('\nAll tutorial dialogues are fully visible and clickable on all tested iPhone viewports.');
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
