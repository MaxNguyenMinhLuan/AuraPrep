
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
    Nature = 'Nature',
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
    names: [string, string, string];  // Names for each evolution stage
    rarity: Rarity;
    type: CreatureType;
    pixelSprite: string[][]; // [stage1, stage2, stage3] - legacy pixel art
    pixelColors: { [key: string]: string };
    evoThreshold1: number;
    evoThreshold2: number;
    description: string;
    spriteUrls?: [string, string, string]; // Sprite URLs for each evolution stage
}

export interface CreatureInstance {
    id: number; // unique instance id
    creatureId: number; // id from INITIAL_CREATURES. Use 0 for custom.
    xp: number;
    evolutionStage: 1 | 2 | 3;
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
