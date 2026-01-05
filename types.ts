
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
    | 'welcome'
    | 'first-mission'
    | 'first-summon'
    | 'second-mission'
    | 'second-summon'
    | 'baseline-intro'
    | 'baseline-test'
    | 'post-baseline'
    | 'complete';

export interface TutorialState {
    isComplete: boolean;
    currentPhase: TutorialPhase;
    currentStep: number;
    baselineCompleted: boolean;
    postBaselineTourCompleted: boolean;
    hasSeenProgress: boolean;
    hasSeenShop: boolean;
    hasSeenTraining: boolean;
    hasSeenLeaderboard: boolean;
    starterPokemonId: number | null;  // Track which starter was chosen
    baselineProgress?: {
        currentIndex: number;
        answers: { subtopic: string; isCorrect: boolean }[];
        questions: any[];  // Store generated questions
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
