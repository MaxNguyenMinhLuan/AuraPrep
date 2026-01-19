
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

// Pokemon sprite base URL for placeholder testing
// NOTE: These Pokemon sprites are placeholders for testing only and will be replaced with original characters before commercial launch
const SPRITE_BASE = 'https://img.pokemondb.net/sprites/black-white/anim/normal/';

// Helper to create sprite URL
const sprite = (name: string): string => `${SPRITE_BASE}${name}.gif`;

// Empty pixel sprite for Pokemon (we'll use spriteUrls instead)
const EMPTY_SPRITE: string[][] = [[''], [''], ['']];
const EMPTY_COLORS: { [key: string]: string } = {};

// ============================================================================
// EVOLUTION LEVELS
// Pokemon evolve at specific levels like the real games
// All Pokemon start at Level 5 and can reach Level 100
// ============================================================================

export const INITIAL_CREATURES: Creature[] = [
    // ===== 3-STAGE EVOLUTION LINES =====
    // Starter Pokemon (evolve at 16, 36)
    {
        id: 1,
        name: 'Bulbasaur',
        names: ['Bulbasaur', 'Ivysaur', 'Venusaur'],
        rarity: Rarity.Rare,
        type: CreatureType.Leaf,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 3,
        evolveLevel1: 16,
        evolveLevel2: 32,
        description: 'A seed Pokemon that grows with sunlight.',
        spriteUrls: [sprite('bulbasaur'), sprite('ivysaur'), sprite('venusaur')]
    },
    {
        id: 2,
        name: 'Charmander',
        names: ['Charmander', 'Charmeleon', 'Charizard'],
        rarity: Rarity.Rare,
        type: CreatureType.Fire,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 3,
        evolveLevel1: 16,
        evolveLevel2: 36,
        description: 'A fire Pokemon whose tail flame shows its life force.',
        spriteUrls: [sprite('charmander'), sprite('charmeleon'), sprite('charizard')]
    },
    {
        id: 3,
        name: 'Squirtle',
        names: ['Squirtle', 'Wartortle', 'Blastoise'],
        rarity: Rarity.Rare,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 3,
        evolveLevel1: 16,
        evolveLevel2: 36,
        description: 'A water Pokemon with a protective shell.',
        spriteUrls: [sprite('squirtle'), sprite('wartortle'), sprite('blastoise')]
    },

    // Bug Pokemon (quick evolution at 7, 10)
    {
        id: 4,
        name: 'Caterpie',
        names: ['Caterpie', 'Metapod', 'Butterfree'],
        rarity: Rarity.Common,
        type: CreatureType.Leaf,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 3,
        evolveLevel1: 7,
        evolveLevel2: 10,
        description: 'A bug Pokemon that evolves into a beautiful butterfly.',
        spriteUrls: [sprite('caterpie'), sprite('metapod'), sprite('butterfree')]
    },
    {
        id: 5,
        name: 'Weedle',
        names: ['Weedle', 'Kakuna', 'Beedrill'],
        rarity: Rarity.Common,
        type: CreatureType.Leaf,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 3,
        evolveLevel1: 7,
        evolveLevel2: 10,
        description: 'A bug Pokemon with poisonous stingers.',
        spriteUrls: [sprite('weedle'), sprite('kakuna'), sprite('beedrill')]
    },

    // Bird Pokemon (evolve at 18, 36)
    {
        id: 6,
        name: 'Pidgey',
        names: ['Pidgey', 'Pidgeotto', 'Pidgeot'],
        rarity: Rarity.Common,
        type: CreatureType.Wind,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 3,
        evolveLevel1: 18,
        evolveLevel2: 36,
        description: 'A common bird Pokemon found in many regions.',
        spriteUrls: [sprite('pidgey'), sprite('pidgeotto'), sprite('pidgeot')]
    },

    // Nidoran lines (evolve at 16, 36 with Moon Stone equivalent)
    {
        id: 7,
        name: 'Nidoran♀',
        names: ['Nidoran♀', 'Nidorina', 'Nidoqueen'],
        rarity: Rarity.Common,
        type: CreatureType.Dark,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 3,
        evolveLevel1: 16,
        evolveLevel2: 36,
        description: 'A female poison Pokemon with barbs.',
        spriteUrls: [sprite('nidoran-f'), sprite('nidorina'), sprite('nidoqueen')]
    },
    {
        id: 8,
        name: 'Nidoran♂',
        names: ['Nidoran♂', 'Nidorino', 'Nidoking'],
        rarity: Rarity.Common,
        type: CreatureType.Dark,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 3,
        evolveLevel1: 16,
        evolveLevel2: 36,
        description: 'A male poison Pokemon with horns.',
        spriteUrls: [sprite('nidoran-m'), sprite('nidorino'), sprite('nidoking')]
    },

    // Oddish line (evolve at 21, 36)
    {
        id: 9,
        name: 'Oddish',
        names: ['Oddish', 'Gloom', 'Vileplume'],
        rarity: Rarity.Common,
        type: CreatureType.Leaf,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 3,
        evolveLevel1: 21,
        evolveLevel2: 36,
        description: 'A weed Pokemon that releases toxic pollen.',
        spriteUrls: [sprite('oddish'), sprite('gloom'), sprite('vileplume')]
    },

    // Poliwag line (evolve at 25, 36)
    {
        id: 10,
        name: 'Poliwag',
        names: ['Poliwag', 'Poliwhirl', 'Poliwrath'],
        rarity: Rarity.Common,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 3,
        evolveLevel1: 25,
        evolveLevel2: 36,
        description: 'A tadpole Pokemon with a spiral pattern.',
        spriteUrls: [sprite('poliwag'), sprite('poliwhirl'), sprite('poliwrath')]
    },

    // Abra line (evolve at 16, 36)
    {
        id: 11,
        name: 'Abra',
        names: ['Abra', 'Kadabra', 'Alakazam'],
        rarity: Rarity.Common,
        type: CreatureType.Light,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 3,
        evolveLevel1: 16,
        evolveLevel2: 36,
        description: 'A psychic Pokemon that can teleport.',
        spriteUrls: [sprite('abra'), sprite('kadabra'), sprite('alakazam')]
    },

    // Machop line (evolve at 28, 40)
    {
        id: 12,
        name: 'Machop',
        names: ['Machop', 'Machoke', 'Machamp'],
        rarity: Rarity.Common,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 3,
        evolveLevel1: 28,
        evolveLevel2: 40,
        description: 'A muscular fighting Pokemon.',
        spriteUrls: [sprite('machop'), sprite('machoke'), sprite('machamp')]
    },

    // Bellsprout line (evolve at 21, 36)
    {
        id: 13,
        name: 'Bellsprout',
        names: ['Bellsprout', 'Weepinbell', 'Victreebel'],
        rarity: Rarity.Common,
        type: CreatureType.Leaf,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 3,
        evolveLevel1: 21,
        evolveLevel2: 36,
        description: 'A carnivorous plant Pokemon.',
        spriteUrls: [sprite('bellsprout'), sprite('weepinbell'), sprite('victreebel')]
    },

    // Geodude line (evolve at 25, 40)
    {
        id: 14,
        name: 'Geodude',
        names: ['Geodude', 'Graveler', 'Golem'],
        rarity: Rarity.Common,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 3,
        evolveLevel1: 25,
        evolveLevel2: 40,
        description: 'A rock Pokemon often mistaken for a boulder.',
        spriteUrls: [sprite('geodude'), sprite('graveler'), sprite('golem')]
    },

    // Gastly line (evolve at 25, 40) - RARE
    {
        id: 15,
        name: 'Gastly',
        names: ['Gastly', 'Haunter', 'Gengar'],
        rarity: Rarity.Rare,
        type: CreatureType.Dark,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 3,
        evolveLevel1: 25,
        evolveLevel2: 40,
        description: 'A ghost Pokemon made of gas.',
        spriteUrls: [sprite('gastly'), sprite('haunter'), sprite('gengar')]
    },

    // Dratini line (slow - evolve at 30, 55) - RARE
    {
        id: 16,
        name: 'Dratini',
        names: ['Dratini', 'Dragonair', 'Dragonite'],
        rarity: Rarity.Rare,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 3,
        evolveLevel1: 30,
        evolveLevel2: 55,
        description: 'A mystical dragon Pokemon.',
        spriteUrls: [sprite('dratini'), sprite('dragonair'), sprite('dragonite')]
    },

    // ===== 2-STAGE EVOLUTION LINES =====
    {
        id: 17,
        name: 'Rattata',
        names: ['Rattata', 'Raticate'],
        rarity: Rarity.Common,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 20,
        description: 'A quick rodent Pokemon.',
        spriteUrls: [sprite('rattata'), sprite('raticate')]
    },
    {
        id: 18,
        name: 'Spearow',
        names: ['Spearow', 'Fearow'],
        rarity: Rarity.Common,
        type: CreatureType.Wind,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 20,
        description: 'An aggressive bird Pokemon.',
        spriteUrls: [sprite('spearow'), sprite('fearow')]
    },
    {
        id: 19,
        name: 'Ekans',
        names: ['Ekans', 'Arbok'],
        rarity: Rarity.Common,
        type: CreatureType.Dark,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 22,
        description: 'A snake Pokemon that moves silently.',
        spriteUrls: [sprite('ekans'), sprite('arbok')]
    },
    {
        id: 20,
        name: 'Pikachu',
        names: ['Pikachu', 'Raichu'],
        rarity: Rarity.Rare,
        type: CreatureType.Electric,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 30,
        description: 'An electric mouse Pokemon.',
        spriteUrls: [sprite('pikachu'), sprite('raichu')]
    },
    {
        id: 21,
        name: 'Sandshrew',
        names: ['Sandshrew', 'Sandslash'],
        rarity: Rarity.Common,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 22,
        description: 'A ground Pokemon that burrows in sand.',
        spriteUrls: [sprite('sandshrew'), sprite('sandslash')]
    },
    {
        id: 22,
        name: 'Clefairy',
        names: ['Clefairy', 'Clefable'],
        rarity: Rarity.Rare,
        type: CreatureType.Light,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 30,
        description: 'A magical fairy Pokemon.',
        spriteUrls: [sprite('clefairy'), sprite('clefable')]
    },
    {
        id: 23,
        name: 'Vulpix',
        names: ['Vulpix', 'Ninetales'],
        rarity: Rarity.Common,
        type: CreatureType.Fire,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 30,
        description: 'A fox Pokemon with multiple tails.',
        spriteUrls: [sprite('vulpix'), sprite('ninetales')]
    },
    {
        id: 24,
        name: 'Jigglypuff',
        names: ['Jigglypuff', 'Wigglytuff'],
        rarity: Rarity.Common,
        type: CreatureType.Light,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 30,
        description: 'A balloon Pokemon with a soothing song.',
        spriteUrls: [sprite('jigglypuff'), sprite('wigglytuff')]
    },
    {
        id: 25,
        name: 'Zubat',
        names: ['Zubat', 'Golbat'],
        rarity: Rarity.Common,
        type: CreatureType.Dark,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 22,
        description: 'A bat Pokemon that uses ultrasonic waves.',
        spriteUrls: [sprite('zubat'), sprite('golbat')]
    },
    {
        id: 26,
        name: 'Paras',
        names: ['Paras', 'Parasect'],
        rarity: Rarity.Common,
        type: CreatureType.Leaf,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 24,
        description: 'A mushroom Pokemon with parasitic fungi.',
        spriteUrls: [sprite('paras'), sprite('parasect')]
    },
    {
        id: 27,
        name: 'Venonat',
        names: ['Venonat', 'Venomoth'],
        rarity: Rarity.Common,
        type: CreatureType.Dark,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 31,
        description: 'A bug Pokemon with large radar eyes.',
        spriteUrls: [sprite('venonat'), sprite('venomoth')]
    },
    {
        id: 28,
        name: 'Diglett',
        names: ['Diglett', 'Dugtrio'],
        rarity: Rarity.Common,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 26,
        description: 'A mole Pokemon that burrows underground.',
        spriteUrls: [sprite('diglett'), sprite('dugtrio')]
    },
    {
        id: 29,
        name: 'Meowth',
        names: ['Meowth', 'Persian'],
        rarity: Rarity.Common,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 28,
        description: 'A cat Pokemon that loves shiny objects.',
        spriteUrls: [sprite('meowth'), sprite('persian')]
    },
    {
        id: 30,
        name: 'Psyduck',
        names: ['Psyduck', 'Golduck'],
        rarity: Rarity.Common,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 33,
        description: 'A duck Pokemon with psychic powers.',
        spriteUrls: [sprite('psyduck'), sprite('golduck')]
    },
    {
        id: 31,
        name: 'Mankey',
        names: ['Mankey', 'Primeape'],
        rarity: Rarity.Common,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 28,
        description: 'A fighting Pokemon with rage issues.',
        spriteUrls: [sprite('mankey'), sprite('primeape')]
    },
    {
        id: 32,
        name: 'Growlithe',
        names: ['Growlithe', 'Arcanine'],
        rarity: Rarity.Common,
        type: CreatureType.Fire,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 35,
        description: 'A loyal fire Pokemon.',
        spriteUrls: [sprite('growlithe'), sprite('arcanine')]
    },
    {
        id: 33,
        name: 'Tentacool',
        names: ['Tentacool', 'Tentacruel'],
        rarity: Rarity.Common,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 30,
        description: 'A jellyfish Pokemon.',
        spriteUrls: [sprite('tentacool'), sprite('tentacruel')]
    },
    {
        id: 34,
        name: 'Ponyta',
        names: ['Ponyta', 'Rapidash'],
        rarity: Rarity.Common,
        type: CreatureType.Fire,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 40,
        description: 'A fire horse Pokemon.',
        spriteUrls: [sprite('ponyta'), sprite('rapidash')]
    },
    {
        id: 35,
        name: 'Slowpoke',
        names: ['Slowpoke', 'Slowbro'],
        rarity: Rarity.Common,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 37,
        description: 'A slow-witted Pokemon.',
        spriteUrls: [sprite('slowpoke'), sprite('slowbro')]
    },
    {
        id: 36,
        name: 'Magnemite',
        names: ['Magnemite', 'Magneton'],
        rarity: Rarity.Common,
        type: CreatureType.Electric,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 30,
        description: 'An electric magnet Pokemon.',
        spriteUrls: [sprite('magnemite'), sprite('magneton')]
    },
    {
        id: 37,
        name: 'Doduo',
        names: ['Doduo', 'Dodrio'],
        rarity: Rarity.Common,
        type: CreatureType.Wind,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 31,
        description: 'A two-headed bird Pokemon.',
        spriteUrls: [sprite('doduo'), sprite('dodrio')]
    },
    {
        id: 38,
        name: 'Seel',
        names: ['Seel', 'Dewgong'],
        rarity: Rarity.Common,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 34,
        description: 'A sea lion Pokemon.',
        spriteUrls: [sprite('seel'), sprite('dewgong')]
    },
    {
        id: 39,
        name: 'Grimer',
        names: ['Grimer', 'Muk'],
        rarity: Rarity.Common,
        type: CreatureType.Dark,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 38,
        description: 'A sludge Pokemon.',
        spriteUrls: [sprite('grimer'), sprite('muk')]
    },
    {
        id: 40,
        name: 'Shellder',
        names: ['Shellder', 'Cloyster'],
        rarity: Rarity.Common,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 30,
        description: 'A bivalve Pokemon.',
        spriteUrls: [sprite('shellder'), sprite('cloyster')]
    },
    {
        id: 41,
        name: 'Drowzee',
        names: ['Drowzee', 'Hypno'],
        rarity: Rarity.Common,
        type: CreatureType.Light,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 26,
        description: 'A hypnosis Pokemon.',
        spriteUrls: [sprite('drowzee'), sprite('hypno')]
    },
    {
        id: 42,
        name: 'Krabby',
        names: ['Krabby', 'Kingler'],
        rarity: Rarity.Common,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 28,
        description: 'A crab Pokemon with large pincers.',
        spriteUrls: [sprite('krabby'), sprite('kingler')]
    },
    {
        id: 43,
        name: 'Voltorb',
        names: ['Voltorb', 'Electrode'],
        rarity: Rarity.Common,
        type: CreatureType.Electric,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 30,
        description: 'A ball Pokemon often mistaken for a Poke Ball.',
        spriteUrls: [sprite('voltorb'), sprite('electrode')]
    },
    {
        id: 44,
        name: 'Exeggcute',
        names: ['Exeggcute', 'Exeggutor'],
        rarity: Rarity.Common,
        type: CreatureType.Leaf,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 35,
        description: 'An egg Pokemon that gathers in groups.',
        spriteUrls: [sprite('exeggcute'), sprite('exeggutor')]
    },
    {
        id: 45,
        name: 'Cubone',
        names: ['Cubone', 'Marowak'],
        rarity: Rarity.Common,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 28,
        description: 'A lonely Pokemon wearing its mother\'s skull.',
        spriteUrls: [sprite('cubone'), sprite('marowak')]
    },
    {
        id: 46,
        name: 'Koffing',
        names: ['Koffing', 'Weezing'],
        rarity: Rarity.Common,
        type: CreatureType.Dark,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 35,
        description: 'A poison gas Pokemon.',
        spriteUrls: [sprite('koffing'), sprite('weezing')]
    },
    {
        id: 47,
        name: 'Rhyhorn',
        names: ['Rhyhorn', 'Rhydon'],
        rarity: Rarity.Common,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 42,
        description: 'A rhino Pokemon with incredible strength.',
        spriteUrls: [sprite('rhyhorn'), sprite('rhydon')]
    },
    {
        id: 48,
        name: 'Horsea',
        names: ['Horsea', 'Seadra'],
        rarity: Rarity.Common,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 32,
        description: 'A seahorse Pokemon.',
        spriteUrls: [sprite('horsea'), sprite('seadra')]
    },
    {
        id: 49,
        name: 'Goldeen',
        names: ['Goldeen', 'Seaking'],
        rarity: Rarity.Common,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 33,
        description: 'A goldfish Pokemon.',
        spriteUrls: [sprite('goldeen'), sprite('seaking')]
    },
    {
        id: 50,
        name: 'Staryu',
        names: ['Staryu', 'Starmie'],
        rarity: Rarity.Common,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 30,
        description: 'A star-shaped Pokemon.',
        spriteUrls: [sprite('staryu'), sprite('starmie')]
    },
    {
        id: 51,
        name: 'Magikarp',
        names: ['Magikarp', 'Gyarados'],
        rarity: Rarity.Common,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 20,
        description: 'A weak Pokemon that evolves into a powerful dragon.',
        spriteUrls: [sprite('magikarp'), sprite('gyarados')]
    },
    {
        id: 52,
        name: 'Eevee',
        names: ['Eevee', 'Vaporeon'],
        rarity: Rarity.Rare,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 25,
        description: 'An evolution Pokemon that can take many forms.',
        spriteUrls: [sprite('eevee'), sprite('vaporeon')]
    },
    {
        id: 53,
        name: 'Omanyte',
        names: ['Omanyte', 'Omastar'],
        rarity: Rarity.Rare,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 40,
        description: 'A prehistoric Pokemon resurrected from a fossil.',
        spriteUrls: [sprite('omanyte'), sprite('omastar')]
    },
    {
        id: 54,
        name: 'Kabuto',
        names: ['Kabuto', 'Kabutops'],
        rarity: Rarity.Rare,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 2,
        evolveLevel1: 40,
        description: 'An ancient Pokemon with sharp claws.',
        spriteUrls: [sprite('kabuto'), sprite('kabutops')]
    },

    // ===== SINGLE-STAGE POKEMON (No Evolution) =====
    // These can still level up to 100 and get stronger!
    {
        id: 55,
        name: 'Farfetch\'d',
        names: ['Farfetch\'d'],
        rarity: Rarity.Common,
        type: CreatureType.Wind,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A duck Pokemon that carries a leek.',
        spriteUrls: [sprite('farfetchd')]
    },
    {
        id: 56,
        name: 'Onix',
        names: ['Onix'],
        rarity: Rarity.Common,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A giant rock snake Pokemon.',
        spriteUrls: [sprite('onix')]
    },
    {
        id: 57,
        name: 'Hitmonlee',
        names: ['Hitmonlee'],
        rarity: Rarity.Rare,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A kicking fiend Pokemon.',
        spriteUrls: [sprite('hitmonlee')]
    },
    {
        id: 58,
        name: 'Hitmonchan',
        names: ['Hitmonchan'],
        rarity: Rarity.Rare,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A punching Pokemon with lightning fast fists.',
        spriteUrls: [sprite('hitmonchan')]
    },
    {
        id: 59,
        name: 'Lickitung',
        names: ['Lickitung'],
        rarity: Rarity.Common,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A Pokemon with an incredibly long tongue.',
        spriteUrls: [sprite('lickitung')]
    },
    {
        id: 60,
        name: 'Chansey',
        names: ['Chansey'],
        rarity: Rarity.Rare,
        type: CreatureType.Light,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A kind Pokemon that shares eggs with the injured.',
        spriteUrls: [sprite('chansey')]
    },
    {
        id: 61,
        name: 'Tangela',
        names: ['Tangela'],
        rarity: Rarity.Common,
        type: CreatureType.Leaf,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A Pokemon covered in blue vines.',
        spriteUrls: [sprite('tangela')]
    },
    {
        id: 62,
        name: 'Kangaskhan',
        names: ['Kangaskhan'],
        rarity: Rarity.Rare,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A parent Pokemon that protects its baby.',
        spriteUrls: [sprite('kangaskhan')]
    },
    {
        id: 63,
        name: 'Mr. Mime',
        names: ['Mr. Mime'],
        rarity: Rarity.Common,
        type: CreatureType.Light,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A mime Pokemon that creates invisible walls.',
        spriteUrls: [sprite('mr-mime')]
    },
    {
        id: 64,
        name: 'Scyther',
        names: ['Scyther'],
        rarity: Rarity.Rare,
        type: CreatureType.Leaf,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A mantis Pokemon with razor-sharp scythes.',
        spriteUrls: [sprite('scyther')]
    },
    {
        id: 65,
        name: 'Jynx',
        names: ['Jynx'],
        rarity: Rarity.Rare,
        type: CreatureType.Light,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A humanoid Pokemon that dances rhythmically.',
        spriteUrls: [sprite('jynx')]
    },
    {
        id: 66,
        name: 'Electabuzz',
        names: ['Electabuzz'],
        rarity: Rarity.Rare,
        type: CreatureType.Electric,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'An electric Pokemon found near power plants.',
        spriteUrls: [sprite('electabuzz')]
    },
    {
        id: 67,
        name: 'Magmar',
        names: ['Magmar'],
        rarity: Rarity.Rare,
        type: CreatureType.Fire,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A fire Pokemon born in volcanic craters.',
        spriteUrls: [sprite('magmar')]
    },
    {
        id: 68,
        name: 'Pinsir',
        names: ['Pinsir'],
        rarity: Rarity.Rare,
        type: CreatureType.Leaf,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A stag beetle Pokemon with powerful pincers.',
        spriteUrls: [sprite('pinsir')]
    },
    {
        id: 69,
        name: 'Tauros',
        names: ['Tauros'],
        rarity: Rarity.Common,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A wild bull Pokemon that charges at anything.',
        spriteUrls: [sprite('tauros')]
    },
    {
        id: 70,
        name: 'Lapras',
        names: ['Lapras'],
        rarity: Rarity.Rare,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A gentle giant that ferries people across water.',
        spriteUrls: [sprite('lapras')]
    },
    {
        id: 71,
        name: 'Ditto',
        names: ['Ditto'],
        rarity: Rarity.Common,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A Pokemon that can transform into anything.',
        spriteUrls: [sprite('ditto')]
    },
    {
        id: 72,
        name: 'Porygon',
        names: ['Porygon'],
        rarity: Rarity.Rare,
        type: CreatureType.Electric,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A virtual Pokemon made of programming code.',
        spriteUrls: [sprite('porygon')]
    },
    {
        id: 73,
        name: 'Aerodactyl',
        names: ['Aerodactyl'],
        rarity: Rarity.Rare,
        type: CreatureType.Wind,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A prehistoric flying Pokemon.',
        spriteUrls: [sprite('aerodactyl')]
    },
    {
        id: 74,
        name: 'Snorlax',
        names: ['Snorlax'],
        rarity: Rarity.Rare,
        type: CreatureType.Metal,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A sleeping Pokemon that blocks roads.',
        spriteUrls: [sprite('snorlax')]
    },

    // ===== LEGENDARY POKEMON (No Evolution) =====
    {
        id: 75,
        name: 'Articuno',
        names: ['Articuno'],
        rarity: Rarity.Legendary,
        type: CreatureType.Water,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A legendary ice bird Pokemon.',
        spriteUrls: [sprite('articuno')]
    },
    {
        id: 76,
        name: 'Zapdos',
        names: ['Zapdos'],
        rarity: Rarity.Legendary,
        type: CreatureType.Electric,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A legendary electric bird Pokemon.',
        spriteUrls: [sprite('zapdos')]
    },
    {
        id: 77,
        name: 'Moltres',
        names: ['Moltres'],
        rarity: Rarity.Legendary,
        type: CreatureType.Fire,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A legendary fire bird Pokemon.',
        spriteUrls: [sprite('moltres')]
    },
    {
        id: 78,
        name: 'Mewtwo',
        names: ['Mewtwo'],
        rarity: Rarity.Legendary,
        type: CreatureType.Light,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A powerful psychic Pokemon created by science.',
        spriteUrls: [sprite('mewtwo')]
    },
    {
        id: 79,
        name: 'Mew',
        names: ['Mew'],
        rarity: Rarity.Legendary,
        type: CreatureType.Light,
        pixelSprite: EMPTY_SPRITE,
        pixelColors: EMPTY_COLORS,
        maxEvolutionStage: 1,
        description: 'A rare mythical Pokemon.',
        spriteUrls: [sprite('mew')]
    }
];
