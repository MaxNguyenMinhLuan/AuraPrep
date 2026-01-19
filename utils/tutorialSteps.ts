import { TutorialPhase, TutorialState } from '../types';

// Tutorial milestone constants
export const PROGRESS_UNLOCK_QUESTIONS = 60;  // Questions needed to unlock Progress tab
export const LEADERBOARD_UNLOCK_QUESTIONS = 120;  // Questions needed to unlock Leaderboard

export const INITIAL_TUTORIAL_STATE: TutorialState = {
    isComplete: false,
    currentPhase: 'welcome',
    currentStep: 0,

    // Question tracking
    totalQuestionsAnswered: 0,

    // Feature unlock status
    progressUnlocked: false,
    trainingUnlocked: false,
    shopUnlocked: false,
    leaderboardUnlocked: false,

    // Tutorial practice tracking
    tutorialPracticeCorrect: 0,
    tutorialPracticeWrong: false,
    tutorialBossCompleted: false,
    tutorialShopPurchased: false,

    // Creature selection
    starterPokemonId: null,
    hasChosenActiveCreature: false,

    // Legacy fields
    baselineCompleted: false,
    postBaselineTourCompleted: false,
    hasSeenProgress: false,
    hasSeenShop: false,
    hasSeenTraining: false,
    hasSeenLeaderboard: false,
};

// Starter Pokemon IDs (Bulbasaur, Charmander, Squirtle)
export const STARTER_IDS = [1, 2, 3];

// Tutorial skill ID - special skill that appears during tutorial
export const TUTORIAL_SKILL_ID = 'Tutorial: Basics';

export const TUTORIAL_DIALOGUE = {
    // ============================================
    // PHASE 1: Onboarding
    // ============================================

    welcome: {
        greeting: "Welcome, Seeker! I'm Professor Pikachu. Ready to begin your SAT mastery journey?",
        button: "Let's Go!"
    },

    chooseStarter: {
        intro: "Every great trainer needs a Guardian!",
        prompt: "Choose your first partner wisely. They'll grow stronger as YOU grow stronger!",
        celebration: (name: string) => `Excellent choice! ${name} will be a great partner!`
    },

    firstEasyMission: {
        intro: "Let's try your first practice question! Don't worry, it's an easy one.",
        encouragement: "You've got this!",
        completion: "Great job! You completed your first question!"
    },

    firstReward: {
        celebration: "Amazing! Here's 500 Aura as a reward!",
        explanation: "Aura is the currency you'll use to summon new Guardians and buy power-ups.",
        nextStep: "Now let's use that Aura to summon another Guardian!"
    },

    forcedSummon: {
        intro: "Time to expand your team! Let's summon a new Guardian.",
        instruction: "Tap the Summon button to spend your Aura!",
        celebration: "Awesome! You've got a new Guardian!"
    },

    forcedBestiary: {
        intro: "Let's check out your new Guardian in the Bestiary!",
        instruction: "Tap on your Guardian to see their details.",
        evolutionExplanation: "As your Guardian levels up, they can EVOLVE into stronger forms!",
        levelingExplanation: "Your Guardian gains XP when you complete missions.",
        tapToSee: "Tap on a Guardian to learn more about them!"
    },

    chooseActiveCreature: {
        intro: "Now you have multiple Guardians! Time to choose your active partner.",
        instruction: "Your ACTIVE Guardian is the one who gains XP from your missions.",
        prompt: "Tap on a Guardian and set them as your active partner!",
        confirmation: (name: string) => `${name} is now your active Guardian! They'll grow with you.`
    },

    explainDailyMissions: {
        intro: "Here's how AuraPrep works:",
        point1: "Every day, you'll get 3 Daily Missions with SAT questions.",
        point2: "Complete missions to earn Aura and level up your Guardian!",
        point3: "During your first days, the difficulty will vary a lot.",
        point4: "That's because I'm learning your skill level to give you the perfect challenge!",
        ready: "Ready to start your training?"
    },

    // ============================================
    // PHASE 2: Daily Missions (Stealth Diagnostic)
    // ============================================

    dailyMissionsUnlocked: {
        intro: "Your Daily Missions are ready!",
        tip: "Complete all 3 missions each day to maximize your Aura and XP!",
        reminder: "Remember: I'm still calibrating your skill levels, so question difficulty may vary."
    },

    stealthDiagnostic: {
        // Shown subtly during first 60 questions
        calibrating: "Calibrating your skill levels...",
        almostThere: (questionsLeft: number) => `${questionsLeft} more questions until Progress unlocks!`
    },

    // ============================================
    // PHASE 3: Progress Tab Unlock (60 questions)
    // ============================================

    progressUnlocked: {
        celebration: "Congratulations! You've unlocked the PROGRESS tab!",
        explanation: "Now you can track your skills and take on Boss Fights!",
        button: "Check it out!"
    },

    progressTour: {
        intro: "Welcome to your Progress Tracker!",
        skillList: "Here you can see all SAT topics and your current level in each.",
        levels: "Skills progress: Easy → Medium → Hard → Master",
        practice: "Practice mode lets you drill specific topics.",
        bossFight: "Win Boss Fights to level up your skills!",
        tutorialSkill: "I've added a special 'Tutorial' skill for you to try."
    },

    tutorialPractice: {
        intro: "Let's practice with the Tutorial skill!",
        instruction: "Answer 3 questions correctly to complete a streak.",
        correct: (count: number) => `${count}/3 correct! Keep going!`,
        wrongSetup: "Now let's see what happens when you get one wrong...",
        wrongExplanation: "Don't worry about wrong answers! They help you learn."
    },

    trainingUnlocked: {
        celebration: "Training mode is now unlocked!",
        explanation: "When you answer incorrectly, questions go to your Training Queue.",
        purpose: "Review them here to master tough concepts and earn bonus Aura!",
        button: "Let's check it out!"
    },

    forcedTraining: {
        intro: "Here's your Training Queue!",
        instruction: "The question you got wrong is waiting here.",
        purpose: "Try answering it again to remove it from the queue.",
        reward: "You'll earn 15 Aura for each question you master in training!",
        complete: "Great! You've learned how to use Training mode."
    },

    shopUnlocked: {
        celebration: "The Shop is now unlocked!",
        explanation: "Buy power-ups to help you in tough situations!",
        button: "Let's go shopping!"
    },

    forcedShop: {
        intro: "Welcome to the Shop!",
        explanation: "Power-ups can help you during missions and boss fights.",
        powerups: {
            eliminate: "50/50: Remove two wrong answers",
            skip: "Skip: Replace a tough question",
            hint: "Hint: Get a helpful clue",
            secondChance: "Second Wind: Survive one wrong answer",
            doubleJeopardy: "Double Jeopardy: Risk it all for double rewards!"
        },
        instruction: "Try buying one power-up now!",
        complete: "Perfect! You can buy more power-ups anytime."
    },

    tutorialBoss: {
        intro: "Now for the ultimate test: a Boss Fight!",
        explanation: "Boss Fights are 10-question challenges. Win to level up your skill!",
        instruction: "You can use power-ups during the fight if you need them.",
        encouragement: "Don't worry, this Tutorial boss is designed to be beatable!",
        victory: "Amazing! You defeated the Tutorial Boss!",
        skillUp: "Your Tutorial skill has been mastered!"
    },

    tutorialSkillComplete: {
        celebration: "You've completed the Tutorial!",
        explanation: "The Tutorial skill will now disappear, but you've learned everything you need.",
        encouragement: "Now go conquer the real SAT topics!",
        button: "Start Training!"
    },

    // ============================================
    // PHASE 4: Leaderboard Unlock (120 questions)
    // ============================================

    leaderboardUnlocked: {
        celebration: "The Leaderboard is now unlocked!",
        explanation: "Compete with other Seekers to prove your worth!",
        button: "Check the rankings!"
    },

    leaderboardTour: {
        intro: "Welcome to the Leaderboard!",
        leagues: "There are 6 leagues: Bronze → Silver → Gold → Platinum → Diamond → Master",
        ranking: "You're ranked by weekly Aura earned.",
        promotion: "Finish in the Top 5 to get PROMOTED to a higher league!",
        demotion: "Finish in the Bottom 3 and you'll be DEMOTED.",
        reset: "Leagues reset every Monday. Fight for your rank!",
        encouragement: "Climb to the top and become a legend!"
    },

    // ============================================
    // TUTORIAL COMPLETE
    // ============================================

    complete: {
        celebration: "You've mastered the basics, Seeker!",
        summary: "You now have access to everything AuraPrep offers:",
        features: [
            "Daily Missions to earn Aura and XP",
            "Progress tracking and Boss Fights",
            "Training mode to review mistakes",
            "Shop for power-ups",
            "Leaderboard competition"
        ],
        farewell: "I believe in you. Now go become an SAT legend!",
        button: "Begin My Journey!"
    },

    // ============================================
    // LEGACY DIALOGUE (preserved for rollback)
    // ============================================

    firstMission: {
        intro: "First, let's test your skills! Complete this mission to earn your first Aura Points!",
        encouragement: ["Great start! Keep going!", "You're doing amazing!", "Almost there!"],
        completion: "Incredible! You earned 500 Aura Points! Now let's summon your first Guardian!"
    },
    firstSummon: {
        intro: "Guardians will fight alongside you, growing stronger as you learn!",
        starterPrompt: "Choose wisely! This Guardian will be your first partner.",
        celebration: (name: string) => `Meet ${name}! Your journey together begins now!`
    },
    guardianBond: {
        intro: "This is your Guardian! They'll grow stronger as YOU grow stronger.",
        xpExplanation: "Complete missions to earn XP for your Guardian.",
        evolutionHint: "When they level up enough, they can evolve!"
    },
    secondMission: {
        intro: "Let's earn more Aura for another summon!",
        completion: "Your Guardian is growing! And you've earned more Aura!"
    },
    secondSummon: {
        intro: "Time for your second Guardian! This summon is from the full collection.",
        celebration: "Excellent! Now you have two Guardians!"
    },
    welcomeMission: {
        intro: "Now let's start your real training! Complete this Welcome Mission to unlock all features.",
        encouragement: "Great job! Your skill levels are being calibrated as you answer.",
        completion: "Welcome Mission Complete! All features unlocked!"
    },
    baselineIntro: {
        intro: "Before we continue, I need to assess your current skill level.",
        explanation: "Don't worry! This Baseline Assessment will help us create the perfect training plan for you.",
        reward: "Complete it to unlock ALL features and earn 1,000 Aura!"
    },
    baselineTest: {
        sectionComplete: (section: string) => `✓ ${section} Complete! Moving on...`,
        encouragement: "You're doing great! Keep going!"
    },
    baselineResults: {
        analyzing: "Analyzing your results...",
        complete: "Assessment Complete!",
        unlocked: "All features unlocked!"
    },
    postBaseline: {
        progress: {
            intro: "Let me show you your new tools! First, your Progress Tracker.",
            explanation: "Here you can see your skill levels in each topic.",
            levelUp: "Practice to level up from Easy → Medium → Hard → Master!",
            difficulty: "The higher your level, the harder your questions—and the faster you'll improve!"
        },
        shop: {
            intro: "The Shop lets you buy power-ups with Aura!",
            powerups: {
                eliminate: "Eliminate 2: Remove two wrong answers",
                skip: "Skip: Skip a tough question",
                hint: "Hint: Get a helpful clue",
                secondChance: "Second Chance: Retry a wrong answer",
                doubleJeopardy: "Double Jeopardy: Risk it all for big rewards!"
            }
        },
        training: {
            intro: "When you answer incorrectly, questions go to your Training Queue.",
            purpose: "Review them here to master tough concepts and earn bonus Aura!",
            empty: "Complete missions to build your training queue."
        },
        leaderboard: {
            intro: "Compete weekly against other Seekers in your League!",
            promotion: "Finish Top 5 to get PROMOTED to a higher league!",
            demotion: "Finish Bottom 3 and you'll be DEMOTED.",
            reset: "Leagues reset every Monday!"
        },
        complete: {
            intro: "You're all set, Seeker!",
            encouragement: "Complete daily missions, level up your Guardians, and climb the leagues!",
            farewell: "I believe in you. Now go become a legend!"
        }
    }
};

// Helper to get questions remaining for next milestone
export function getQuestionsUntilNextUnlock(totalAnswered: number, progressUnlocked: boolean, leaderboardUnlocked: boolean): { feature: string; remaining: number } | null {
    if (!progressUnlocked && totalAnswered < PROGRESS_UNLOCK_QUESTIONS) {
        return {
            feature: 'Progress',
            remaining: PROGRESS_UNLOCK_QUESTIONS - totalAnswered
        };
    }
    if (!leaderboardUnlocked && totalAnswered < LEADERBOARD_UNLOCK_QUESTIONS) {
        return {
            feature: 'Leaderboard',
            remaining: LEADERBOARD_UNLOCK_QUESTIONS - totalAnswered
        };
    }
    return null;
}
