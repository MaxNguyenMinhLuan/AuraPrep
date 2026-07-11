const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
    console.log('Launching browser in headless mode with iPhone 12 viewport...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
    });
    const page = await context.newPage();

    // Route /api/game-data GET to return mock user data to avoid loading blocks
    await page.route('**/api/game-data', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                success: true,
                profile: {
                    name: 'Max',
                    stats: {},
                    dailyStreak: 5,
                    lastStreakDate: new Date().toISOString().split('T')[0],
                    weeklyAuraGain: 1200,
                    league: 'Bronze'
                },
                creatures: [
                    { id: 1, creatureId: 1, name: 'Bulbasaur', type: 'Leaf', level: 5, evolutionStage: 1, xp: 10, isFavorite: true },
                    { id: 2, creatureId: 4, name: 'Pikachu', type: 'Electric', level: 6, evolutionStage: 1, xp: 20, isFavorite: false }
                ],
                activeCreature: { creatureId: 1 },
                auraBalance: 100000,
                dailyActivity: { date: new Date().toISOString().split('T')[0], missions: [] },
                reviewQueue: [],
                userTeam: [1, 2],
                tutorialState: {
                    isComplete: true,
                    currentPhase: 'complete',
                    baselineCompleted: true,
                    progressUnlocked: true,
                    trainingUnlocked: true,
                    shopUnlocked: true,
                    leaderboardUnlocked: true,
                }
            })
        });
    });

    // Mock Firebase auth check response in LocalStorage
    await page.addInitScript(() => {
        const mockUser = {
            uid: 'mock-uid-maxidea',
            email: 'maxidea2008@gmail.com',
            displayName: 'Max',
            emailVerified: true
        };
        localStorage.setItem('aura_current_user', JSON.stringify(mockUser));
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        // Mock profile, creatures, aura, tutorial
        localStorage.setItem('aura_mock-uid-maxidea_userProfile', JSON.stringify({
            name: 'Max',
            stats: {},
            dailyStreak: 5,
            lastStreakDate: new Date().toISOString().split('T')[0],
            weeklyAuraGain: 1200,
            league: 'Bronze'
        }));
        
        localStorage.setItem('aura_mock-uid-maxidea_userCreatures', JSON.stringify([
            { id: 1, creatureId: 1, name: 'Bulbasaur', type: 'Leaf', level: 5, evolutionStage: 1, xp: 10, isFavorite: true },
            { id: 2, creatureId: 4, name: 'Pikachu', type: 'Electric', level: 6, evolutionStage: 1, xp: 20, isFavorite: false }
        ]));
        
        localStorage.setItem('aura_mock-uid-maxidea_activeCreatureId', '1');
        localStorage.setItem('aura_mock-uid-maxidea_auraPoints', '100000');
        
        localStorage.setItem('aura_mock-uid-maxidea_tutorialState', JSON.stringify({
            isComplete: true,
            currentPhase: 'complete',
            baselineCompleted: true,
            progressUnlocked: true,
            trainingUnlocked: true,
            shopUnlocked: true,
            leaderboardUnlocked: true,
        }));
    });

    console.log('Navigating to http://localhost:3003/...');
    await page.goto('http://localhost:3003/', { waitUntil: 'networkidle' });

    // Wait 3 seconds for client-side hydration to complete
    await page.waitForTimeout(3000);

    const artifactDir = '/Users/maxminhluannguyen/.gemini/antigravity/brain/a4cde437-dee0-4e20-ad0c-13e12a8cc52a';
    if (!fs.existsSync(artifactDir)) {
        fs.mkdirSync(artifactDir, { recursive: true });
    }

    // 1. Dashboard screenshot
    console.log('Capturing Dashboard screenshot...');
    await page.screenshot({ path: path.join(artifactDir, 'dashboard_mobile.png') });

    // 2. Navigate to Progress tab
    console.log('Navigating to Progress...');
    const progressNav = page.locator('#nav-progress-mobile');
    if (await progressNav.count() > 0) {
        await progressNav.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(artifactDir, 'progress_mobile.png') });
    } else {
        console.warn('Progress mobile selector not found');
    }

    // 3. Navigate to Summon tab
    console.log('Navigating to Summon...');
    const summonNav = page.locator('#nav-summon-mobile');
    if (await summonNav.count() > 0) {
        await summonNav.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(artifactDir, 'summon_mobile.png') });
    } else {
        console.warn('Summon mobile selector not found');
    }

    // 4. Navigate to Collection (Bestiary) tab
    console.log('Navigating to Collection...');
    const bestiaryNav = page.locator('#nav-bestiary-mobile');
    if (await bestiaryNav.count() > 0) {
        await bestiaryNav.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(artifactDir, 'bestiary_mobile.png') });
    } else {
        console.warn('Bestiary mobile selector not found');
    }

    // 5. Navigate to Shop
    console.log('Navigating to Dashboard and clicking Shop...');
    const missionNav = page.locator('#nav-mission-mobile');
    if (await missionNav.count() > 0) {
        await missionNav.click();
        await page.waitForTimeout(1000);
        
        // Find button containing text "Shop" and click it
        const shopBtn = page.locator('button:has-text("Shop")');
        if (await shopBtn.count() > 0) {
            await shopBtn.first().click();
            await page.waitForTimeout(1500);
            await page.screenshot({ path: path.join(artifactDir, 'shop_mobile.png') });
        } else {
            console.warn('Shop button text locator not found');
        }
    }

    console.log('Test runs complete! All screenshots saved in artifact folder.');
    await browser.close();
}

run().catch(err => {
    console.error('Error running mobile UI test script:', err);
    process.exit(1);
});
