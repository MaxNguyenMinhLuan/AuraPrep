import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3002/shop-test.html', { waitUntil: 'load' });
await page.waitForSelector('text=Item Shop');
const btn = page.locator('div.grid > div.bg-surface button').first();
const r = await btn.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return { x: rect.x, y: rect.y };
});
console.log(r);
await browser.close();
