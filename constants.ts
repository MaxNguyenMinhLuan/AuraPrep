
import { Creature, Rarity, CreatureType, PowerUpType, LeagueType } from './types';

export const SUBTOPICS: string[] = [
    'Algebra: Absolute Value',
    'Algebra: Linear Functions',
    'Algebra: Dividing Polynomials',
    'Algebra: Exponential Functions',
    'Algebra: Inequalities',
    'Algebra: Polynomial Manipulation',
    'Algebra: Quadratic Equations',
    'Algebra: Single Variable Equations',
    'Algebra: Systems of Linear Equations',
    'Algebra: Systems of Nonlinear Equations',
    'Coordinate Geometry: Lines and Slopes',
    'Coordinate Geometry: Nonlinear Functions',
    'Geometry: Circles',
    'Geometry: Lines and Angles',
    'Geometry: Solid Geometry',
    'Geometry: Triangles and Polygons',
    'Geometry: Trigonometry',
    'Data: Categories and Probabilities',
    'Data: Experimental Interpretation',
    'Data: Central Tendency and Standard Deviation',
    'Data: Scatterplots and Graphs',
    'Function Notation',
    'Formulas and Expressions',
    'Numbers: Sequences',
    'Ratios and Proportions',
    'R/W: Multiple Text Analysis',
    'R/W: Quantitative Analysis',
    'R/W: Text Structure and Purpose',
    'R/W: Command of Evidence',
    'R/W: Finding Key Details',
    'R/W: Drawing Inferences',
    'R/W: Identifying Main Idea',
    'R/W: Rhetorical Synthesis',
    'R/W: Determining Sentence Purpose',
    'R/W: Vocabulary in Context',
    'Grammar: Subject-Verb Agreement',
    'Grammar: Conventional Expression',
    'Grammar: Modifiers',
    'Grammar: Possessives',
    'Grammar: Pronouns',
    'Grammar: Punctuation',
    'Grammar: Sentence Structure',
    'Grammar: Verb Tense',
    'Rhetoric: Precision',
    'Rhetoric: Transitions'
];

export const LEAGUES: LeagueType[] = [
    LeagueType.BRONZE,
    LeagueType.SILVER,
    LeagueType.GOLD,
    LeagueType.PLATINUM,
    LeagueType.DIAMOND,
    LeagueType.MASTER
];

export const SUMMON_COST = 500;
export const AURA_POINTS_PER_PRACTICE_STREAK = 50;
export const STREAK_BONUS_BASE = 10;
export const STREAK_BONUS_MAX = 100;

export interface PowerUpDef {
    id: PowerUpType;
    name: string;
    description: string;
    cost: number;
    icon: string;
}

export const POWER_UPS: PowerUpDef[] = [
    {
        id: 'ELIMINATE',
        name: '50/50',
        description: 'Removes two incorrect answers.',
        cost: 100,
        icon: '✂️'
    },
    {
        id: 'HINT',
        name: 'Oracle\'s Insight',
        description: 'Reveals the explanation before answering.',
        cost: 150,
        icon: '👁️'
    },
    {
        id: 'SKIP',
        name: 'Phase Shift',
        description: 'Swap question for a new one. Old goes to Training.',
        cost: 75,
        icon: '🌀'
    },
    {
        id: 'SECOND_CHANCE',
        name: 'Second Wind',
        description: 'Survive one incorrect answer.',
        cost: 50,
        icon: '🛡️'
    },
    {
        id: 'DOUBLE_JEOPARDY',
        name: 'Double Jeopardy',
        description: 'If you answer incorrectly, you can choose to either keep the points earned and end the mission, or risk losing all points earned in the mission to answer again.',
        cost: 200,
        icon: '🏹'
    }
];

export const INITIAL_CREATURES: Creature[] = [
    // Common
    { id: 1, name: 'Sproutling', rarity: Rarity.Common, type: CreatureType.Nature, pixelColors: {'g':'#a3e635','G':'#4d7c0f','b':'#78350f'}, pixelSprite: [[' g ','gGg',' b '],[' gGg ','gGGg ',' GgG ','  b  ','  b  '],[' gGgGg ','gGGGGg','GGGGGG',' gGgGg ','  bbb  ','  bbb  ']], evoThreshold1: 100, evoThreshold2: 300, description: 'A tiny seed bursting with potential, drawing energy from the sun.' },
    { id: 2, name: 'Droplet', rarity: Rarity.Common, type: CreatureType.Water, pixelColors: {'b':'#60a5fa','B':'#2563eb','w':'#ffffff'}, pixelSprite: [[' w ','bBb',' b '],[' bwb ','bBBBb',' BBB ',' bBb '],['  w w  ',' bBbBb ','bBBBBBb',' BBBBB ','  bBb  ']], evoThreshold1: 100, evoThreshold2: 300, description: 'A playful orb of pure water, it can change shape at will.' },
    { id: 3, name: 'Pebblie', rarity: Rarity.Common, type: CreatureType.Metal, pixelColors: {'g':'#a1a1aa','G':'#52525b','d':'#27272a'}, pixelSprite: [[' g ','gGg',' d '],[' dgd ','gGGg','GGGG',' gGg '],['  gGg  ',' gGGg ','gGGGGg','GGGGGG',' gGGg ']], evoThreshold1: 100, evoThreshold2: 300, description: 'A stubborn but loyal creature made of ancient, unyielding stone.' },
    { id: 4, name: 'Gusty', rarity: Rarity.Common, type: CreatureType.Wind, pixelColors: {'w':'#ffffff','g':'#e5e7eb','G':'#9ca3af'}, pixelSprite: [[' w ','gGg',' w '],[' wgw ','gGGgw','wGGg',' wg '],['  wgw  ',' wgggw ','wgggggw',' wgggw ','  wgw  ']], evoThreshold1: 100, evoThreshold2: 300, description: 'A mischievous wisp of air that loves to play tricks.' },
    { 
        id: 10, 
        name: 'Clipturn', 
        rarity: Rarity.Common, 
        type: CreatureType.Metal, 
        pixelColors: {
            'b':'#94a3b8', // Blue/Steel Blade
            'B':'#475569', // Dark Steel
            'p':'#581c87', // Dark Purple Body
            'P':'#3b0764', // Deepest Purple
            'y':'#fde047', // Yellow Eyes/Beak
            'g':'#1e1b4b', // Handle Outline
            'w':'#f8fafc'  // Shine
        }, 
        pixelSprite: [
            [
                '   p   ',
                '  pyp  ',
                '   p   '
            ],
            [
                ' g   g ',
                '  ppp  ',
                '  pyp  ',
                '  ppp  '
            ],
            [
                '  g   g  ',
                ' b p p b ',
                'bB pyp Bb',
                'bB ppp Bb',
                ' B     B '
            ]
        ], 
        evoThreshold1: 100, 
        evoThreshold2: 300, 
        description: 'A sharp-witted guardian with wings forged from enchanted steel. Its blades are said to be able to cut through the densest of study materials.' 
    },
    // Rare
    { id: 5, name: 'Ember', rarity: Rarity.Rare, type: CreatureType.Fire, pixelColors: {'y':'#facc15','o':'#fb923c','r':'#ef4444'}, pixelSprite: [[' y ','ror',' o '],[' yoy ','rooor',' orro','  y  '],['  yoy  ',' yrrry ','roooor',' orrro ','  yoy  ']], evoThreshold1: 200, evoThreshold2: 600, description: 'A spark of eternal flame with a warm and fiery spirit.' },
    { id: 6, name: 'Sparky', rarity: Rarity.Rare, type: CreatureType.Electric, pixelColors: {'y':'#fde047','Y':'#facc15','w':'#ffffff'}, pixelSprite: [[' y ','ywy',' Y '],['  y  ',' wyw ','yYyYy',' YwY ','  y  '],['   y   ','  ywy  ',' wyYyw ','yYyYyYy',' YwYwY ','  ywy  ','   y   ']], evoThreshold1: 200, evoThreshold2: 600, description: 'Crackles with untamed energy, its mood changes like a storm.' },
    { id: 7, name: 'Glim', rarity: Rarity.Rare, type: CreatureType.Light, pixelColors: {'w':'#ffffff','y':'#fef08a','Y':'#fde047'}, pixelSprite: [[' w ','yYy',' w '],['  w  ',' wyw ','yYwYy',' wYw ','  w  '],['   w   ','  wyw  ',' wyYyw ','yYwYwYy',' YwYwY ','  wyw  ','   w   ']], evoThreshold1: 200, evoThreshold2: 600, description: 'A fragment of starlight that illuminates the darkest corners.' },
    // Legendary
    { id: 8, name: 'Nocturne', rarity: Rarity.Legendary, type: CreatureType.Dark, pixelColors: {'p':'#a288e3','P':'#533483','d':'#1a1a2e','w':'#f1f5f9'}, pixelSprite: [[' p ','Pdp',' w '],[' pwp ','pPdp','dP P',' p p '],['  pwp  ',' pPdPp ','dPPPPP',' Pw wP ','  p p  ']], evoThreshold1: 500, evoThreshold2: 1500, description: 'Born from shadows, it holds the mysteries of the night sky within it.' },
    { id: 9, name: 'Aura Dragon', rarity: Rarity.Legendary, type: CreatureType.Light, pixelColors: {'g':'#ffd700','G':'#fbbf24','w':'#ffffff','o':'#f97316'}, pixelSprite: [[' w ','gGg',' o '],[' goG ','gGGwg','GG GG','g w g'],['  gog  ',' gGwGg ','gGGGGwg','gG o Gg',' wGGGw ','   w   ']], evoThreshold1: 500, evoThreshold2: 1500, description: 'A mythical being of immense power, said to be the source of all Aura.' },
];
