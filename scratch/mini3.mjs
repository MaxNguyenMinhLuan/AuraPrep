import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3002/shop-test.html', { waitUntil: 'load' });
await page.waitForSelector('text=Item Shop');
const btn = page.locator('div.grid > div.bg-surface button').first();
await btn.evaluate((el) => el.scrollIntoView({ block: 'center' }));
await page.waitForTimeout(50);

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
    }, handle);
}

const cov = await elementIsCoveredAtCenter(btn);
console.log('cov', cov);
await browser.close();
