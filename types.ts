
export interface User {
    uid: string;
    name: string;
    email: string;
    photoUrl?: string;
}

export enum LeagueType {
    BRONZE = 'Bronze',
    SILVER = 'Silver',
    GOLD = 'Gold',
    PLATINUM = 'Platinum',
    DIAMOND = 'Diamond',
    MASTER = 'Master'
}

export interface Point {
    x: number;
    y: number;
}

export interface GraphData {
    type: 'line' | 'scatter' | 'system';
    points: Point[];
    labels?: { x?: string; y?: string };
}

export interface Question {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
    subtopic: string;
    hasGraphic: boolean;
    graphData?: GraphData;
}

export type SkillLevel = 'Easy' | 'Medium' | 'Hard' | 'Master';

export interface SubtopicStat {
    correct: number;
    incorrect: number;
    level: SkillLevel;
}

export type PowerUpType = 'ELIMINATE' | 'SKIP' | 'HINT' | 'SECOND_CHANCE' | 'DOUBLE_JEOPARDY';

export interface UserProfile {
    stats: {
        [subtopic: string]: SubtopicStat;
    };
    inventory: {
        [key in PowerUpType]?: number;
    };
    dailyStreak: number;
    lastStreakDate: string;
    weeklyAuraGain: number;
    lastWeekResetDate: string;
    league: LeagueType;
}

export enum Rarity {
    Common = 'Common',
    Rare = 'Rare',
    Legendary = 'Legendary',
}

export enum CreatureType {
    Leaf = 'Leaf',
    Fire = 'Fire',
    Water = 'Water',
    Electric = 'Electric',
    Wind = 'Wind',
    Metal = 'Metal',
    Light = 'Light',
    Dark = 'Dark',
}

export interface Creature {
    id: number;
    name: string;  // Base name (e.g., "Charmander" for the Charmander line)
    names: [string, string?, string?];  // Names for each evolution stage (stage 2 & 3 optional)
    rarity: Rarity;
    type: CreatureType;
    pixelSprite: string[][]; // [stage1, stage2, stage3] - legacy pixel art
    pixelColors: { [key: string]: string };
    maxEvolutionStage: 1 | 2 | 3;  // Maximum evolution stage this creature can reach
    evolveLevel1?: number;  // Level to evolve to stage 2 (undefined if maxEvolutionStage is 1)
    evolveLevel2?: number;  // Level to evolve to stage 3 (undefined if maxEvolutionStage is 1 or 2)
    description: string;
    spriteUrls?: [string, string?, string?]; // Sprite URLs for each evolution stage
}

// XP required for each level (level 5-100)
// Formula: XP_for_level = level * 10 (so level 10 needs 100 XP, level 50 needs 500 XP, etc.)
export const XP_PER_LEVEL = 10;
export const MIN_LEVEL = 5;
export const MAX_LEVEL = 100;

export interface CreatureInstance {
    id: number; // unique instance id
    creatureId: number; // id from INITIAL_CREATURES. Use 0 for custom.
    xp: number;  // Total XP earned
    level: number;  // Current level (5-100)
    evolutionStage: 1 | 2 | 3;
    isFavorite?: boolean;  // Whether this creature is favorited (shows first in lists)
    customImageUrl?: string;
    customName?: string;
    customRarity?: Rarity;
}

export interface DailyMission {
    id: string;
    title: string;
    description: string;
    subtopic: string;
    questionCount: number;
    reward: number;
    xp: number;
}

export interface MissionInstance extends DailyMission {
    completed: boolean;
    progress: number;
    correctAnswers: number;
    questions?: Question[];
}

export interface DailyActivity {
    date: string;
    missions: MissionInstance[];
}

export type TutorialPhase =
    // Phase 1: Onboarding
    | 'welcome'                    // Initial greeting from Professor Pikachu
    | 'choose-starter'             // Pick one of 3 starter creatures
    | 'first-easy-mission'         // Do 1 super easy math question
    | 'first-reward'               // Get rewarded 500 aura
    | 'forced-summon'              // Force player to go to summon tab and summon
    | 'forced-bestiary'            // Force player to check bestiary and view creature
    | 'choose-active-creature'     // Force player to choose active creature
    | 'explain-daily-missions'     // Explain daily missions and stealth diagnostic

    // Phase 2: Daily Missions (stealth diagnostic)
    | 'daily-missions-unlocked'    // Player can now do daily missions freely

    // Phase 3: Progress Tab Unlock (after 60 questions)
    | 'progress-unlocked'          // Pop-up: Progress unlocked
    | 'progress-tour'              // Guide around progress tab
    | 'tutorial-practice'          // Forced practice: 3 correct then 1 wrong
    | 'training-unlocked'          // Pop-up: Training unlocked
    | 'forced-training'            // Force player to go to training
    | 'shop-unlocked'              // Pop-up: Shop unlocked
    | 'forced-shop'                // Force player to buy 1 power-up
    | 'tutorial-boss'              // Force tutorial boss fight
    | 'tutorial-skill-complete'    // Tutorial skill disappears

    // Phase 4: Leaderboard Unlock (after 120 questions)
    | 'leaderboard-unlocked'       // Pop-up: Leaderboard unlocked
    | 'leaderboard-tour'           // Explain leaderboard function

    // Final
    | 'complete'                   // Tutorial fully done

    // Legacy phases - preserved for potential rollback
    | 'first-mission'              // Legacy
    | 'first-summon'               // Legacy
    | 'second-mission'             // Legacy
    | 'second-summon'              // Legacy
    | 'welcome-mission'            // Legacy stealth diagnostic
    | 'baseline-intro'             // Legacy
    | 'baseline-test'              // Legacy
    | 'post-baseline';             // Legacy

export interface TutorialState {
    isComplete: boolean;
    currentPhase: TutorialPhase;
    currentStep: number;

    // Question tracking for milestone unlocks
    totalQuestionsAnswered: number;      // Track total questions for 60/120 milestones

    // Feature unlock status
    progressUnlocked: boolean;           // Unlocked after 60 questions
    trainingUnlocked: boolean;           // Unlocked after first wrong answer in tutorial practice
    shopUnlocked: boolean;               // Unlocked after training tutorial
    leaderboardUnlocked: boolean;        // Unlocked after 120 questions

    // Tutorial practice tracking
    tutorialPracticeCorrect: number;     // Track correct answers in tutorial practice (need 3)
    tutorialPracticeWrong: boolean;      // Has gotten the forced wrong answer
    tutorialBossCompleted: boolean;      // Has completed tutorial boss fight
    tutorialShopPurchased: boolean;      // Has bought 1 power-up during tutorial

    // Creature selection tracking
    starterPokemonId: number | null;     // Track which starter was chosen
    hasChosenActiveCreature: boolean;    // Has explicitly chosen active creature

    // Legacy fields - preserved for compatibility
    baselineCompleted: boolean;          // Legacy - now maps to progress unlock
    postBaselineTourCompleted: boolean;  // Legacy
    hasSeenProgress: boolean;            // Legacy
    hasSeenShop: boolean;                // Legacy
    hasSeenTraining: boolean;            // Legacy
    hasSeenLeaderboard: boolean;         // Legacy
    baselineProgress?: {
        currentIndex: number;
        answers: { subtopic: string; isCorrect: boolean }[];
        questions: any[];
    };
}


export enum View {
    DASHBOARD = 'DASHBOARD',
    MISSION = 'MISSION',
    SUMMON = 'SUMMON',
    BESTIARY = 'BESTIARY',
    PROGRESS = 'PROGRESS',
    REVIEW = 'REVIEW',
    SHOP = 'SHOP',
    LEADERBOARD = 'LEADERBOARD',
    LOGIN = 'LOGIN'
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Extra Hard';

export interface DBQuestion {
    Question: string;
    A: string;
    B: string;
    C: string;
    D: string;
    CorrectAns: 'A' | 'B' | 'C' | 'D';
    Type: string;
    Difficulty: Difficulty;
    Source: string;
    Explanation?: string; 
}
