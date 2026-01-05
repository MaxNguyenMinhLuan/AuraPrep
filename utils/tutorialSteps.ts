import { TutorialPhase, TutorialState } from '../types';

export const INITIAL_TUTORIAL_STATE: TutorialState = {
    isComplete: false,
    currentPhase: 'welcome',
    currentStep: 0,
    baselineCompleted: false,
    postBaselineTourCompleted: false,
    hasSeenProgress: false,
    hasSeenShop: false,
    hasSeenTraining: false,
    hasSeenLeaderboard: false,
    starterPokemonId: null,
};

// Starter Pokemon IDs (Bulbasaur, Charmander, Squirtle)
export const STARTER_IDS = [1, 2, 3];

export const TUTORIAL_DIALOGUE = {
    welcome: {
        greeting: "Welcome, Seeker! I'm Professor Pikachu. Let's begin your SAT mastery journey!",
        button: "Begin Your Journey"
    },
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
