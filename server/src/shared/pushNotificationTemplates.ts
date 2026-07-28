/**
 * Passive-aggressive push notification templates (Duolingo-style).
 *
 * Four categories, ten templates each. Each template's `body` may reference
 * {PARTNER_NAME}, {STREAK_COUNT}, {RIVAL}, or {LEAGUE_NAME} - substituted by
 * renderPushTemplate() before sending. Category selection (which set of ten
 * to pull from) is decided by nudge.service.ts based on the user's actual
 * state; this module only owns the copy and the substitution mechanics.
 */

export type PushCategory = 'dailyMissions' | 'streak' | 'leaderboard' | 'auraFarming';

export interface PushTemplate {
    id: string;
    title: string;
    body: string;
}

export interface PushVariables {
    partnerName: string;
    streakCount: number;
    rival: string;
    leagueName: string;
}

// Flavor names for the leaderboard's fictional competitors. There is no real
// multi-user leaderboard backend today - LeaderboardView.tsx fills the board
// with client-side-generated `mockCompetitors` that are never sent to the
// server - so {RIVAL} can't reference an actual person. These keep the copy
// in the spirit of the (currently simulated) leaderboard rather than leaving
// the line generic.
const RIVAL_NAME_POOL = [
    'Alex_SATgrinder', 'QuizQueen22', 'MathWhizKid', 'StudyNinja',
    'GrammarGoblin', 'VocabVillain', 'TheCuriousOwl', 'PrepPhantom',
    'ScoreChaser', 'MidnightScholar',
];

export function pickRival(): string {
    return RIVAL_NAME_POOL[Math.floor(Math.random() * RIVAL_NAME_POOL.length)];
}

export function renderPushTemplate(template: PushTemplate, vars: PushVariables): { title: string; body: string } {
    const substitute = (text: string) =>
        text
            .replace(/\{PARTNER_NAME\}/g, vars.partnerName)
            .replace(/\{STREAK_COUNT\}/g, String(vars.streakCount))
            .replace(/\{RIVAL\}/g, vars.rival)
            .replace(/\{LEAGUE_NAME\}/g, vars.leagueName);

    return { title: substitute(template.title), body: substitute(template.body) };
}

export function pickRandomTemplate(category: PushCategory): PushTemplate {
    const bank = PUSH_TEMPLATES[category];
    return bank[Math.floor(Math.random() * bank.length)];
}

export const PUSH_TEMPLATES: Record<PushCategory, PushTemplate[]> = {

    // 1. Daily Missions - sent when the user hasn't completed today's missions.
    dailyMissions: [
        {
            id: 'resting-brain-cells',
            title: '🧠 Go ahead, take a break',
            body: "These math equations won't solve themselves, but let your brain cells rest. They've had a tough day doing absolutely nothing.",
        },
        {
            id: 'colleges-love-personality',
            title: '📚 No SAT prep today?',
            body: "That's fine. Honestly, colleges are starting to value 'personality' and 'vibes' over actual test scores anyway. Good luck with that.",
        },
        {
            id: 'not-mad-just-disappointed',
            title: '💔 A quiet day in the academy',
            body: "We noticed you haven't opened AuraPrep today. We're not mad. Just... disappointed. Mostly disappointed.",
        },
        {
            id: 'auramon-reading-books',
            title: '🐢 Your partner is waiting...',
            body: '{PARTNER_NAME} got bored waiting for you and started reading a dictionary. It now has a higher vocabulary score than you.',
        },
        {
            id: 'the-ghost-town',
            title: '👻 Is anyone home?',
            body: "Your daily missions are sitting here getting dusty. But hey, I'm sure whatever you're doing on TikTok is way more important.",
        },
        {
            id: 'smart-phone-lazy-owner',
            title: '📱 Ping!',
            body: "Your phone is smart, the app is ready, the missions are waiting... yet here we are. Tap to prove you're the one in charge.",
        },
        {
            id: 'future-self-apology',
            title: '✉️ A letter to your future self',
            body: 'Dear future me, sorry I skipped my daily missions today. I really wanted to work a retail job instead.',
        },
        {
            id: 'the-ignored-reminder',
            title: "🔔 I'll just leave this here...",
            body: "Since you ignored my last three reminders, I thought I'd try a fourth time. Feel free to swipe me away again. I'm used to it.",
        },
        {
            id: 'aura-evaporation',
            title: '💨 Aura is evaporating',
            body: '{PARTNER_NAME} is waiting on your missions. Every minute you delay, it loses a tiny bit of respect for you.',
        },
        {
            id: 'the-short-sat-quiz',
            title: '❓ Pop Quiz!',
            body: "Which of the following is true? A) You're studying. B) You're ignoring this app. Hint: It's definitely B. Let's fix that.",
        },
    ],

    // 2. Streak - sent in the evening when an active streak is about to be lost.
    streak: [
        {
            id: 'nice-streak',
            title: '🔥 That\'s a nice {STREAK_COUNT}-day streak you have there',
            body: 'It would be a real shame if something happened to it... in exactly 4 hours. Save it now.',
        },
        {
            id: 'your-fault',
            title: '⚠️ Your streak is dying',
            body: "I'm not saying it's your fault, but... it is literally your fault. Complete a mission now to rescue it.",
        },
        {
            id: 'explain-to-your-auramon',
            title: '😿 Abandonment issues',
            body: 'Save your streak or prepare to explain to {PARTNER_NAME} why you walked away from everything you built together.',
        },
        {
            id: 'streak-has-feelings',
            title: '💧 Your streak is crying',
            body: 'Yes, it has feelings. Unlike you, apparently. Show some heart and complete one quick mission.',
        },
        {
            id: 'the-sad-companion',
            title: "🥺 Don't look them in the eyes",
            body: '{PARTNER_NAME} is staring at your failing streak with deep, sad eyes. Don\'t let them down.',
        },
        {
            id: 'one-job',
            title: '🚫 You had one job',
            body: 'Keep the streak alive. That was it. Just one click. Instead, you\'re reading this notification. Tap it and study!',
        },
        {
            id: 'the-streak-eulogy',
            title: '🪦 Rest in Peace?',
            body: 'We are drafting a eulogy for your {STREAK_COUNT}-day streak. Unless you want to perform emergency resuscitation right now?',
        },
        {
            id: 'cold-shoulder',
            title: '🧊 Getting cold',
            body: 'That streak was hot, but now it\'s freezing. Complete a mission before midnight or start over from zero tomorrow.',
        },
        {
            id: 'just-2-minutes',
            title: '⏱️ Literally 120 seconds',
            body: "That's all it takes to save your streak. Or you can spend the next 120 seconds feeling guilty. Your choice.",
        },
        {
            id: 'the-ultimate-threat',
            title: '👀 I see you',
            body: 'I know you saw this. Your streak knows you saw this. Do the mission, or tomorrow you start back at day 1. Don\'t test me.',
        },
    ],

    // 3. Leaderboard - sent on rank changes or as the weekly reset approaches.
    // {RIVAL} is drawn from a flavor-name pool (see note above the pool) since
    // there is no real multi-user leaderboard backend to source a name from.
    leaderboard: [
        {
            id: 'the-view-from-above',
            title: '👋 A message from {RIVAL}',
            body: 'They just passed you on the leaderboard. They said to tell you the view from above is great, but you wouldn\'t know.',
        },
        {
            id: 'cozy-bottom',
            title: '📉 Slipping down the ranks',
            body: "Don't worry, the bottom of the leaderboard is actually very cozy. Very little effort or ambition required down there.",
        },
        {
            id: 'tiktok-more-important',
            title: '🛡️ Someone took your spot',
            body: 'Are we just going to let them do that? Or are we too busy scrolling through videos to reclaim our honor?',
        },
        {
            id: 'the-wave',
            title: '🌊 Wave goodbye!',
            body: 'Your rivals are waving at you as they climb higher into the {LEAGUE_NAME} League. You\'re staying behind, right?',
        },
        {
            id: 'relegation-vacation',
            title: '🏖️ Enjoy the demotion zone!',
            body: "You're currently in line for relegation. Hope you packed sunscreen, because you're dropping down a tier.",
        },
        {
            id: 'the-polite-request',
            title: '👑 Excuse me, seeker',
            body: 'Your spot in the top ranks has been rented out to someone who actually studies. Please move to the back of the line.',
        },
        {
            id: 'the-virtual-laugh',
            title: "🤭 They're laughing at us",
            body: 'The other Seekers in the {LEAGUE_NAME} League are laughing at our score. Let\'s go prove them wrong before Sunday!',
        },
        {
            id: 'leaderboard-recluse',
            title: '🙈 Are you hiding?',
            body: 'Your ranking is so low right now, we had to scroll for three pages to find you. Let\'s change that immediately.',
        },
        {
            id: 'sunday-midnight-regret',
            title: '⏰ Clock is ticking',
            body: 'The weekly league reset is tonight. Are you going to promote, or are you going to explain to your family why you gave up?',
        },
        {
            id: 'the-challenger-approaches',
            title: '🤺 Duel invitation',
            body: '{RIVAL} is right behind you and they look hungry. One correct answer keeps them at bay. Don\'t get lazy now.',
        },
    ],

    // 4. Aura Farming - encourages earning Aura for the Divine Portal summon pool.
    auraFarming: [
        {
            id: '0-aura-skill-issue',
            title: '🚨 Aura Check: 0 Aura',
            body: "Imagine having exactly 0 Aura. Couldn't be you... oh wait, you haven't studied today. Tap to start aurafarming immediately.",
        },
        {
            id: 'auramaxxing-season',
            title: '💎 Stop being mid',
            body: 'The Divine Portal is glowing. Stop being mid and start auramaxxing right now by finishing today\'s SAT quest.',
        },
        {
            id: 'rival-auramaxxing',
            title: '📈 {RIVAL} is auramaxxing',
            body: 'Your rival is out here auramaxxing while you are sitting on 0 Aura. Go farm some points and summon a partner to carry you.',
        },
        {
            id: 'common-auramon-disappointment',
            title: '💀 Even the Commons are embarrassed',
            body: 'You have 0 Aura today. Even the Common Auramons are embarrassed to be in your Bestiary. Go study and get some respect.',
        },
        {
            id: 'legendary-pull-math',
            title: '🔮 Portal Odds: 0%?',
            body: "You can't summon a Legendary if you have 0 Aura points. Do the math. Farm some questions and pull from the portal.",
        },
        {
            id: '10x-summon-hype',
            title: '✨ Aurafarming is active',
            body: 'Harvest season is here. Clear your reading/writing missions, rack up that Aura, and hit that 10x summon button.',
        },
        {
            id: 'no-rizz-0-aura',
            title: '👀 Your partner has a message:',
            body: '{PARTNER_NAME} says you have no study rizz and 0 Aura today. Prove them wrong and clear a quick challenge.',
        },
        {
            id: 'underground-farming-guild',
            title: '🌾 Time to farm',
            body: "Get in the study fields and start aurafarming. Those questions aren't going to solve themselves, and the portal is waiting.",
        },
        {
            id: 'negative-aura-warning',
            title: '📉 Negative Aura detected',
            body: 'Skipping daily prep is a massive skill issue that drops you to negative Aura. Open the app now to restore your status.',
        },
        {
            id: 'the-ultimate-flex',
            title: '👑 Maximize your Aura',
            body: "Want to auramaxx and flex on the leaderboard? Complete today's missions and claim the high-tier pulls you deserve.",
        },
    ],
};
