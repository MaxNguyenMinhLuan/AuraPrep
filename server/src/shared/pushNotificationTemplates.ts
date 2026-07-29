/**
 * Passive-aggressive push notification templates (Duolingo-style).
 *
 * Four categories, ten templates each. Each template's `body` may reference
 * {PARTNER_NAME}, {STREAK_COUNT}, {RIVAL}, or {LEAGUE_NAME} - substituted by
 * renderPushTemplate() before sending. Category selection (which set of ten
 * to pull from) is decided by nudge.service.ts based on the user's actual
 * state; this module only owns the copy and the substitution mechanics.
 */

export type PushCategory = 'dailyMissions' | 'streak' | 'leaderboard' | 'auraFarming' | 'beyondMissions' | 'lastChance' | 'evolutionSoon';

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
    levelsToEvolve: number;
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
            .replace(/\{LEAGUE_NAME\}/g, vars.leagueName)
            .replace(/\{LEVELS_TO_EVOLVE\}/g, String(vars.levelsToEvolve));

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

    // 5. Beyond Missions - sent for the guaranteed morning/evening slots when
    // today's daily missions are ALREADY done. Redirects the nudge toward
    // Practice/Boss Fights instead of repeating a "do your missions" message
    // that no longer applies.
    beyondMissions: [
        {
            id: 'the-minimum-is-not-enough',
            title: '📊 The daily minimum? Cute.',
            body: "You cleared today's missions. Top preppers stop there. Top scorers don't. A Boss Fight is still standing.",
        },
        {
            id: 'aura-still-warm',
            title: '🔥 Your Aura is still warm',
            body: "Missions: done. But {PARTNER_NAME} knows a fresh Practice session while you're locked in beats one tomorrow when you're not.",
        },
        {
            id: 'overachiever-energy',
            title: '💪 Show-off behavior detected',
            body: "You finished early. Either you're built different, or you're stalling before the real test. Go find out in a Boss Fight.",
        },
        {
            id: 'rest-is-for-the-comfortable',
            title: '😌 Comfortable already?',
            body: "Missions cleared. Comfortable is how scores plateau. One more Practice round and you're still climbing.",
        },
        {
            id: 'the-real-ones-keep-going',
            title: '🏆 The real ones keep going',
            body: '{PARTNER_NAME} has seen this before: mission done, momentum wasted. Not today. Boss Fight, right now.',
        },
        {
            id: 'free-time-is-a-trap',
            title: '⏳ "Free time" is a trap',
            body: "You could close the app now. Or you could bank a Practice session while your brain is already warmed up. Your call.",
        },
        {
            id: 'the-quiet-achiever',
            title: "🤫 Nobody's watching, so why stop?",
            body: "That's exactly why the ones who actually improve keep going after the minimum. One more round, no audience required.",
        },
        {
            id: 'streak-of-effort',
            title: '📈 Missions ≠ mastery',
            body: 'Clearing missions keeps the lights on. Practice and Boss Fights are what actually move the needle. Go move it.',
        },
        {
            id: 'auramon-still-hungry',
            title: '🍽️ {PARTNER_NAME} is still hungry',
            body: "You fed it one mission's worth of Aura. It wants more. So does your score. Hit a Boss Fight.",
        },
        {
            id: 'the-bonus-round',
            title: '✨ Consider this the bonus round',
            body: "Today's requirement is met. Everything past this point is pure score gain. Take the free lap.",
        },
    ],

    // 6. Last Chance - sent when it's late in the day (5pm local) and the
    // user still hasn't touched today's missions at all.
    lastChance: [
        {
            id: 'the-day-is-almost-gone',
            title: '⏳ The day is almost gone',
            body: "It's 5pm and you haven't opened a single mission today. The window is closing. Don't let today be a zero.",
        },
        {
            id: 'last-call',
            title: '📢 Last call',
            body: "This is the part of the day where 'I'll do it later' quietly becomes 'I didn't do it.' Prove that wrong.",
        },
        {
            id: 'evening-is-not-a-plan',
            title: '🌆 \"Tonight\" is not a plan',
            body: "You've said that before. Open one mission now while it's still easy to keep the promise.",
        },
        {
            id: 'the-empty-progress-bar',
            title: '📉 Still at zero today',
            body: '{PARTNER_NAME} has been staring at an empty progress bar since this morning. Give it something to work with.',
        },
        {
            id: 'sunset-deadline',
            title: '🌇 Sunset deadline',
            body: "The rest of your day is about to fill up. Ten minutes now beats zero minutes later. Start a mission.",
        },
        {
            id: 'day-not-over-yet',
            title: '⚠️ Not over yet, but close',
            body: "You still have time to make today count. That window shrinks every hour you wait.",
        },
        {
            id: 'the-honest-truth',
            title: "🫤 Let's be honest",
            body: "If you don't start now, you probably won't tonight either. Prove yourself wrong in the next five minutes.",
        },
        {
            id: 'afternoon-slipped-away',
            title: '🕔 The afternoon slipped away',
            body: "That's fine, it happens. But evening shouldn't slip away too. One mission, right now.",
        },
        {
            id: 'the-quiet-panic',
            title: "😬 A little late-day panic, if you don't mind",
            body: "Zero missions, 5pm, and {PARTNER_NAME} is starting to worry. A quick session would put that to rest.",
        },
        {
            id: 'still-time-technically',
            title: '⏰ Technically still time',
            body: "\"Technically\" is doing a lot of work in that sentence. Close the gap before it closes on you.",
        },
    ],

    // 7. Evolution Soon - sent when the active Auramon is within a couple of
    // levels of its next evolution threshold, independent of mission state.
    evolutionSoon: [
        {
            id: 'so-close',
            title: '✨ {PARTNER_NAME} is SO close',
            body: 'Just {LEVELS_TO_EVOLVE} level(s) from evolving. One good session could be the one that does it.',
        },
        {
            id: 'the-glow-up-is-near',
            title: '🌟 The glow-up is near',
            body: "{PARTNER_NAME} is {LEVELS_TO_EVOLVE} level(s) away from its next evolution. Don't make it wait any longer than it has to.",
        },
        {
            id: 'evolution-incoming',
            title: '🧬 Evolution incoming',
            body: 'A few more correct answers and {PARTNER_NAME} levels up into its next form. Go finish the job.',
        },
        {
            id: 'one-push-away',
            title: '🚀 One push away',
            body: '{LEVELS_TO_EVOLVE} level(s) stand between {PARTNER_NAME} and its next stage. Give it that push.',
        },
        {
            id: 'the-final-stretch',
            title: '🏁 The final stretch',
            body: "You've put in the work to get {PARTNER_NAME} this close. Don't stall out {LEVELS_TO_EVOLVE} level(s) from the finish line.",
        },
        {
            id: 'almost-unrecognizable',
            title: '🔮 Almost unrecognizable',
            body: '{PARTNER_NAME} is {LEVELS_TO_EVOLVE} level(s) from a whole new form. Curious what it looks like? Go find out.',
        },
        {
            id: 'dont-stop-now',
            title: '🛑 Don\'t stop now',
            body: "Evolution is right there, {LEVELS_TO_EVOLVE} level(s) out. This is the worst possible moment to take a break.",
        },
        {
            id: 'patience-has-limits',
            title: '⌛ Even {PARTNER_NAME} has limits',
            body: "It's been waiting patiently for {LEVELS_TO_EVOLVE} more level(s). Patience isn't infinite. Neither is your excuse.",
        },
        {
            id: 'the-countdown',
            title: '⏱️ Evolution countdown: {LEVELS_TO_EVOLVE}',
            body: 'That\'s how many levels stand between {PARTNER_NAME} and its next form. Every mission counts double right now.',
        },
        {
            id: 'built-different-soon',
            title: '💥 About to be built different',
            body: '{LEVELS_TO_EVOLVE} level(s) from evolving, {PARTNER_NAME} is about to hit a new tier. Bring it home.',
        },
    ],
};
