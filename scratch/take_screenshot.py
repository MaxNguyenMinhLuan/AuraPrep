import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto('http://localhost:5173')
        await page.wait_for_timeout(3000)
        # Assuming we need to login or are already authenticated? 
        # Actually AuraPrep requires Google Login. Testing in a headless browser might be tricky if it redirects to login.
        
        await page.screenshot(path='/Users/maxminhluannguyen/AuraPrep/scratch/screenshot.png')
        await browser.close()

asyncio.run(main())
