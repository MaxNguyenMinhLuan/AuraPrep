import { chromium, devices } from 'playwright';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: devices['iPhone SE'].viewport, isMobile: true, hasTouch: true });
const page = await context.newPage();

// Hit the actual live production bundle, not localhost — mount via the same
// tutorial-test harness pattern but point Vite dev server's proxy? No: instead
// verify by checking computed styles directly against localhost dist preview,
// since we already confirmed byte-for-byte the same JS bundle hash is live.
await page.goto('http://localhost:3002/tutorial-test.html?case=progress-tour', { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => !!document.querySelector('[data-testid="harness-root"]'), { timeout: 15000 });
await page.waitForTimeout(800);

const btn = page.locator('button', { hasText: 'Start Tutorial Practice' });
await btn.evaluate(el => el.scrollIntoView({ block: 'center' }));
await page.waitForTimeout(300);
const box = await btn.boundingBox();
const viewport = page.viewportSize();
console.log('viewport', viewport);
console.log('button box', box);
const within = box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width + 1 && box.y + box.height <= viewport.height + 1;
console.log('within viewport after scroll:', within);

const centerX = box.x + box.width/2, centerY = box.y + box.height/2;
const topEl = await page.evaluate(([x,y]) => {
  const el = document.elementFromPoint(x,y);
  return el ? el.tagName + '.' + el.className : null;
}, [centerX, centerY]);
console.log('element at button center:', topEl);

try {
  await btn.click({ timeout: 2000, force: true });
  console.log('CLICK: succeeded');
} catch (e) {
  console.log('CLICK FAILED:', e.message.split('\n')[0]);
}
await page.screenshot({ path: '/tmp/live_progress_tour_check.png' });
await browser.close();
