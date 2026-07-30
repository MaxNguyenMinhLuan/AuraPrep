import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({viewport:{width:390,height:844}});
await page.goto('http://localhost:3002/bestiary-test.html', {waitUntil:'load', timeout:30000});
await page.waitForSelector('text=Collection');
await page.waitForTimeout(500);

// Step through my flow logic manually
const activeTeamSection = page.locator('h2:has-text("Active Team")').locator('..').locator('..');
const slotButtons = await activeTeamSection.locator('.grid button').all();
console.log('slot buttons found:', slotButtons.length);
for (const btn of slotButtons) {
  const isEmpty = await btn.locator('text=Empty').count();
  if (isEmpty === 0) {
    console.log('clicking filled slot to toggle off team');
    await btn.click({force:true});
    break;
  }
}
await page.waitForTimeout(300);

const emptySlot = activeTeamSection.locator('button:has-text("Empty")').first();
console.log('empty slot count', await emptySlot.count());
if (await emptySlot.count()) {
  await emptySlot.click({force:true});
  await page.waitForTimeout(300);
  const selecting = await page.locator('text=Click an Auramon below to add to team').count();
  console.log('selecting mode active after clicking empty slot:', selecting);

  const rosterCards = page.locator('h2:has-text("Your Auramons")').locator('..').locator('..').locator('.grid > div');
  const rosterCount = await rosterCards.count();
  console.log('roster count', rosterCount);
  const firstCardButton = rosterCards.nth(0).locator('button').last();
  await firstCardButton.click({force:true});
  await page.waitForTimeout(300);
  const selecting2 = await page.locator('text=Click an Auramon below to add to team').count();
  console.log('selecting mode active after clicking roster card:', selecting2);

  const emptySlotAgain = activeTeamSection.locator('button:has-text("Empty")').first();
  console.log('empty slot again count', await emptySlotAgain.count());
  if (await emptySlotAgain.count()) {
    await emptySlotAgain.click({force:true});
    await page.waitForTimeout(300);
  }
  const selecting3 = await page.locator('text=Click an Auramon below to add to team').count();
  console.log('selecting mode active after final toggle:', selecting3);
}

// Now try opening detail
const rosterCardOpen = page.locator('h2:has-text("Your Auramons")').locator('..').locator('..').locator('.grid > div').nth(1).locator('button').last();
await rosterCardOpen.click({force:true});
await page.waitForTimeout(400);
const backCount = await page.locator('button:has-text("Back to Collection")').count();
console.log('back button count (detail open?)', backCount);

await browser.close();
