import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3002/shop-test.html', { waitUntil: 'load' });
await page.waitForSelector('text=Item Shop');
const btn = page.locator('div.grid > div.bg-surface button').first();
await btn.evaluate((el) => el.scrollIntoView({ block: 'center' }));
await page.waitForTimeout(50);
const box = await btn.boundingBox();
console.log('box', box);
const cov = await btn.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const topEl = document.elementFromPoint(cx, cy);
    return { covered: !(el === topEl), tag: topEl ? topEl.tagName : null };
});
console.log('cov', cov);
await browser.close();
