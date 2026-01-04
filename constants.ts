
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

// Helper to create sprite URLs for evolution line
const evoSprites = (stage1: string, stage2: string, stage3: string): [string, string, string] => [
    `${SPRITE_BASE}${stage1}.gif`,
    `${SPRITE_BASE}${stage2}.gif`,
    `${SPRITE_BASE}${stage3}.gif`
];

// For 2-stage evolutions, repeat the final form
const evoSprites2 = (stage1: string, stage2: string): [string, string, string] => [
    `${SPRITE_BASE}${stage1}.gif`,
    `${SPRITE_BASE}${stage2}.gif`,
    `${SPRITE_BASE}${stage2}.gif`
];

// Helper to create sprite URL
const spriteUrl = (name: string) => `${GEN5_SPRITE_BASE}${name}.gif`;

// Empty pixel sprite for Pokemon (we'll use spriteUrl instead)
const EMPTY_SPRITE: string[][] = [[''], [''], ['']];
const EMPTY_COLORS: { [key: string]: string } = {};

export const INITIAL_CREATURES: Creature[] = [
    // ===== GEN 1 POKEMON (151) - PLACEHOLDER SPRITES FOR TESTING =====
    // Grass Starters (1-3)
    { id: 1, name: 'Bulbasaur', rarity: Rarity.Common, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'A strange seed was planted on its back at birth. The plant sprouts and grows with this POKéMON.', spriteUrl: spriteUrl('bulbasaur') },
    { id: 2, name: 'Ivysaur', rarity: Rarity.Rare, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'When the bulb on its back grows large, it appears to lose the ability to stand on its hind legs.', spriteUrl: spriteUrl('ivysaur') },
    { id: 3, name: 'Venusaur', rarity: Rarity.Legendary, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'The plant blooms when it is absorbing solar energy. It stays on the move to seek sunlight.', spriteUrl: spriteUrl('venusaur') },
    // Fire Starters (4-6)
    { id: 4, name: 'Charmander', rarity: Rarity.Common, type: CreatureType.Fire, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Obviously prefers hot places. When it rains, steam is said to spout from the tip of its tail.', spriteUrl: spriteUrl('charmander') },
    { id: 5, name: 'Charmeleon', rarity: Rarity.Rare, type: CreatureType.Fire, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'When it swings its burning tail, it elevates the temperature to unbearably high levels.', spriteUrl: spriteUrl('charmeleon') },
    { id: 6, name: 'Charizard', rarity: Rarity.Legendary, type: CreatureType.Fire, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally.', spriteUrl: spriteUrl('charizard') },
    // Water Starters (7-9)
    { id: 7, name: 'Squirtle', rarity: Rarity.Common, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'After birth, its back swells and hardens into a shell. Powerfully sprays foam from its mouth.', spriteUrl: spriteUrl('squirtle') },
    { id: 8, name: 'Wartortle', rarity: Rarity.Rare, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Often hides in water to stalk unwary prey. For swimming fast, it moves its ears to maintain balance.', spriteUrl: spriteUrl('wartortle') },
    { id: 9, name: 'Blastoise', rarity: Rarity.Legendary, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'A brutal POKéMON with pressurized water jets on its shell. They are used for high speed tackles.', spriteUrl: spriteUrl('blastoise') },
    // Caterpie line (10-12)
    { id: 10, name: 'Caterpie', rarity: Rarity.Common, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 50, evoThreshold2: 150, description: 'Its short feet are tipped with suction pads that enable it to tirelessly climb slopes and walls.', spriteUrl: spriteUrl('caterpie') },
    { id: 11, name: 'Metapod', rarity: Rarity.Common, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 50, evoThreshold2: 150, description: 'This POKéMON is vulnerable to attack while its shell is soft, exposing its weak and tender body.', spriteUrl: spriteUrl('metapod') },
    { id: 12, name: 'Butterfree', rarity: Rarity.Rare, type: CreatureType.Wind, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'In battle, it flaps its wings at high speed to release highly toxic dust into the air.', spriteUrl: spriteUrl('butterfree') },
    // Weedle line (13-15)
    { id: 13, name: 'Weedle', rarity: Rarity.Common, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 50, evoThreshold2: 150, description: 'Often found in forests, eating leaves. It has a sharp venomous stinger on its head.', spriteUrl: spriteUrl('weedle') },
    { id: 14, name: 'Kakuna', rarity: Rarity.Common, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 50, evoThreshold2: 150, description: 'Almost incapable of moving, this POKéMON can only harden its shell to protect itself.', spriteUrl: spriteUrl('kakuna') },
    { id: 15, name: 'Beedrill', rarity: Rarity.Rare, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Flies at high speed and attacks using its large venomous stingers on its forelegs and tail.', spriteUrl: spriteUrl('beedrill') },
    // Pidgey line (16-18)
    { id: 16, name: 'Pidgey', rarity: Rarity.Common, type: CreatureType.Wind, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'A common sight in forests and woods. It flaps its wings at ground level to kick up blinding sand.', spriteUrl: spriteUrl('pidgey') },
    { id: 17, name: 'Pidgeotto', rarity: Rarity.Rare, type: CreatureType.Wind, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Very protective of its sprawling territorial area, this POKéMON will fiercely peck at any intruder.', spriteUrl: spriteUrl('pidgeotto') },
    { id: 18, name: 'Pidgeot', rarity: Rarity.Legendary, type: CreatureType.Wind, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'When hunting, it skims the surface of water at high speed to pick off unwary prey such as MAGIKARP.', spriteUrl: spriteUrl('pidgeot') },
    // Rattata line (19-20)
    { id: 19, name: 'Rattata', rarity: Rarity.Common, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Bites anything when it attacks. Small and very quick, it is a common sight in many places.', spriteUrl: spriteUrl('rattata') },
    { id: 20, name: 'Raticate', rarity: Rarity.Rare, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'It uses its whiskers to maintain its balance. It apparently slows down if they are cut off.', spriteUrl: spriteUrl('raticate') },
    // Spearow line (21-22)
    { id: 21, name: 'Spearow', rarity: Rarity.Common, type: CreatureType.Wind, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Eats bugs in grassy areas. It has to flap its short wings at high speed to stay airborne.', spriteUrl: spriteUrl('spearow') },
    { id: 22, name: 'Fearow', rarity: Rarity.Rare, type: CreatureType.Wind, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'With its huge and magnificent wings, it can keep aloft without ever having to land for rest.', spriteUrl: spriteUrl('fearow') },
    // Ekans line (23-24)
    { id: 23, name: 'Ekans', rarity: Rarity.Common, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Moves silently and stealthily. Eats the eggs of birds, such as PIDGEY and SPEAROW, whole.', spriteUrl: spriteUrl('ekans') },
    { id: 24, name: 'Arbok', rarity: Rarity.Rare, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'It is rumored that the ferocious warning markings on its belly differ from area to area.', spriteUrl: spriteUrl('arbok') },
    // Pikachu line (25-26)
    { id: 25, name: 'Pikachu', rarity: Rarity.Rare, type: CreatureType.Electric, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'When several of these POKéMON gather, their electricity could build and cause lightning storms.', spriteUrl: spriteUrl('pikachu') },
    { id: 26, name: 'Raichu', rarity: Rarity.Legendary, type: CreatureType.Electric, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'Its long tail serves as a ground to protect itself from its own high voltage power.', spriteUrl: spriteUrl('raichu') },
    // Sandshrew line (27-28)
    { id: 27, name: 'Sandshrew', rarity: Rarity.Common, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Burrows deep underground in arid locations far from water. It only emerges to hunt for food.', spriteUrl: spriteUrl('sandshrew') },
    { id: 28, name: 'Sandslash', rarity: Rarity.Rare, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Curls up into a spiny ball when threatened. It can roll while curled up to attack or escape.', spriteUrl: spriteUrl('sandslash') },
    // Nidoran line (29-34)
    { id: 29, name: 'Nidoran♀', rarity: Rarity.Common, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Although small, its venomous barbs render this POKéMON dangerous. The female has smaller horns.', spriteUrl: spriteUrl('nidoran-f') },
    { id: 30, name: 'Nidorina', rarity: Rarity.Rare, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'The female\'s horn develops slowly. Prefers physical attacks such as clawing and biting.', spriteUrl: spriteUrl('nidorina') },
    { id: 31, name: 'Nidoqueen', rarity: Rarity.Legendary, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'Its hard scales provide strong protection. It uses its hefty bulk to execute powerful moves.', spriteUrl: spriteUrl('nidoqueen') },
    { id: 32, name: 'Nidoran♂', rarity: Rarity.Common, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Stiffens its ears to sense danger. The larger its horns, the more powerful its secreted venom.', spriteUrl: spriteUrl('nidoran-m') },
    { id: 33, name: 'Nidorino', rarity: Rarity.Rare, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'An aggressive POKéMON that is quick to attack. The horn on its head secretes a powerful venom.', spriteUrl: spriteUrl('nidorino') },
    { id: 34, name: 'Nidoking', rarity: Rarity.Legendary, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'It uses its powerful tail in battle to smash, constrict, then break the prey\'s bones.', spriteUrl: spriteUrl('nidoking') },
    // Clefairy line (35-36)
    { id: 35, name: 'Clefairy', rarity: Rarity.Rare, type: CreatureType.Light, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Its magical and cute appeal has many admirers. It is rare and found only in certain areas.', spriteUrl: spriteUrl('clefairy') },
    { id: 36, name: 'Clefable', rarity: Rarity.Legendary, type: CreatureType.Light, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'A timid fairy POKéMON that is rarely seen. It will run and hide the moment it senses people.', spriteUrl: spriteUrl('clefable') },
    // Vulpix line (37-38)
    { id: 37, name: 'Vulpix', rarity: Rarity.Common, type: CreatureType.Fire, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'At the time of birth, it has just one tail. The tail splits from its tip as it grows older.', spriteUrl: spriteUrl('vulpix') },
    { id: 38, name: 'Ninetales', rarity: Rarity.Legendary, type: CreatureType.Fire, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'Very smart and very vengeful. Grabbing one of its many tails could result in a 1000-year curse.', spriteUrl: spriteUrl('ninetales') },
    // Jigglypuff line (39-40)
    { id: 39, name: 'Jigglypuff', rarity: Rarity.Common, type: CreatureType.Light, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'When its huge eyes light up, it sings a mysteriously soothing melody that lulls its enemies to sleep.', spriteUrl: spriteUrl('jigglypuff') },
    { id: 40, name: 'Wigglytuff', rarity: Rarity.Rare, type: CreatureType.Light, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'The body is soft and rubbery. When angered, it will suck in air and inflate itself to an enormous size.', spriteUrl: spriteUrl('wigglytuff') },
    // Zubat line (41-42)
    { id: 41, name: 'Zubat', rarity: Rarity.Common, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Forms colonies in perpetually dark places. Uses ultrasonic waves to identify and approach targets.', spriteUrl: spriteUrl('zubat') },
    { id: 42, name: 'Golbat', rarity: Rarity.Rare, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Once it strikes, it will not stop draining energy from the victim even if it gets too heavy to fly.', spriteUrl: spriteUrl('golbat') },
    // Oddish line (43-45)
    { id: 43, name: 'Oddish', rarity: Rarity.Common, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'During the day, it keeps its face buried in the ground. At night, it wanders around sowing its seeds.', spriteUrl: spriteUrl('oddish') },
    { id: 44, name: 'Gloom', rarity: Rarity.Rare, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'The fluid that oozes from its mouth isn\'t drool. It is a nectar that is used to attract prey.', spriteUrl: spriteUrl('gloom') },
    { id: 45, name: 'Vileplume', rarity: Rarity.Legendary, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'The larger its petals, the more toxic pollen it contains. Its big head is heavy and hard to hold up.', spriteUrl: spriteUrl('vileplume') },
    // Paras line (46-47)
    { id: 46, name: 'Paras', rarity: Rarity.Common, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Burrows to suck tree roots. The mushrooms on its back grow by drawing nutrients from the bug host.', spriteUrl: spriteUrl('paras') },
    { id: 47, name: 'Parasect', rarity: Rarity.Rare, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'A host-Loss mushroom POKéMON duo in which the weights on the mushroom have taken over control of the bug.', spriteUrl: spriteUrl('parasect') },
    // Venonat line (48-49)
    { id: 48, name: 'Venonat', rarity: Rarity.Common, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Lives in the shadows of tall trees where it eats insects. It is attracted by light at night.', spriteUrl: spriteUrl('venonat') },
    { id: 49, name: 'Venomoth', rarity: Rarity.Rare, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'The dust-like scales covering its wings are color coded to indicate the kinds of poison it has.', spriteUrl: spriteUrl('venomoth') },
    // Diglett line (50-51)
    { id: 50, name: 'Diglett', rarity: Rarity.Common, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Lives about one yard underground where it feeds on plant roots. It sometimes appears above ground.', spriteUrl: spriteUrl('diglett') },
    { id: 51, name: 'Dugtrio', rarity: Rarity.Rare, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'A team of DIGLETT triplets. It triggers huge earthquakes by burrowing 60 miles underground.', spriteUrl: spriteUrl('dugtrio') },
    // Meowth line (52-53)
    { id: 52, name: 'Meowth', rarity: Rarity.Common, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Adores circular objects. Wanders the streets on a nightly basis to look for dropped loose change.', spriteUrl: spriteUrl('meowth') },
    { id: 53, name: 'Persian', rarity: Rarity.Rare, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Although its fur has many admirers, it is tough to raise as a pet because of its fickle meanness.', spriteUrl: spriteUrl('persian') },
    // Psyduck line (54-55)
    { id: 54, name: 'Psyduck', rarity: Rarity.Common, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'While lulling its enemies with its vacant look, this wily POKéMON will use psychokinetic powers.', spriteUrl: spriteUrl('psyduck') },
    { id: 55, name: 'Golduck', rarity: Rarity.Rare, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Often seen swimming elegantly by lake shores. It is often mistaken for the Japanese monster, Kappa.', spriteUrl: spriteUrl('golduck') },
    // Mankey line (56-57)
    { id: 56, name: 'Mankey', rarity: Rarity.Common, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Extremely quick to anger. It could be docile one moment then thrashing away the next instant.', spriteUrl: spriteUrl('mankey') },
    { id: 57, name: 'Primeape', rarity: Rarity.Rare, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Always furious and tenacious to boot. It will not abandon chasing its quarry until it is caught.', spriteUrl: spriteUrl('primeape') },
    // Growlithe line (58-59)
    { id: 58, name: 'Growlithe', rarity: Rarity.Common, type: CreatureType.Fire, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Very protective of its territory. It will bark and bite to repel intruders from its space.', spriteUrl: spriteUrl('growlithe') },
    { id: 59, name: 'Arcanine', rarity: Rarity.Legendary, type: CreatureType.Fire, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'A POKéMON that has been admired since the past for its beauty. It runs agilely as if on wings.', spriteUrl: spriteUrl('arcanine') },
    // Poliwag line (60-62)
    { id: 60, name: 'Poliwag', rarity: Rarity.Common, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Its newly grown legs prevent it from running. It appears to prefer swimming than trying to stand.', spriteUrl: spriteUrl('poliwag') },
    { id: 61, name: 'Poliwhirl', rarity: Rarity.Rare, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Capable of living in or out of water. When out of water, it sweats to keep its body slimy.', spriteUrl: spriteUrl('poliwhirl') },
    { id: 62, name: 'Poliwrath', rarity: Rarity.Legendary, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'An adept swimmer at both the front crawl and breaststroke. Easily overtakes the best human swimmers.', spriteUrl: spriteUrl('poliwrath') },
    // Abra line (63-65)
    { id: 63, name: 'Abra', rarity: Rarity.Common, type: CreatureType.Light, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Using its ability to read minds, it will identify impending danger and TELEPORT to safety.', spriteUrl: spriteUrl('abra') },
    { id: 64, name: 'Kadabra', rarity: Rarity.Rare, type: CreatureType.Light, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'It emits special alpha waves from its body that induce headaches just by being close by.', spriteUrl: spriteUrl('kadabra') },
    { id: 65, name: 'Alakazam', rarity: Rarity.Legendary, type: CreatureType.Light, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'Its brain can outperform a super-computer. Its intelligence quotient is said to be 5,000.', spriteUrl: spriteUrl('alakazam') },
    // Machop line (66-68)
    { id: 66, name: 'Machop', rarity: Rarity.Common, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Loves to build its muscles. It trains in all styles of martial arts to become even stronger.', spriteUrl: spriteUrl('machop') },
    { id: 67, name: 'Machoke', rarity: Rarity.Rare, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Its muscular body is so powerful, it must wear a power save belt to be able to regulate its motions.', spriteUrl: spriteUrl('machoke') },
    { id: 68, name: 'Machamp', rarity: Rarity.Legendary, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'Using its heavy muscles, it throws powerful punches that can send the victim clear over the horizon.', spriteUrl: spriteUrl('machamp') },
    // Bellsprout line (69-71)
    { id: 69, name: 'Bellsprout', rarity: Rarity.Common, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'A carnivorous POKéMON that traps and eats bugs. It uses its root feet to soak up needed moisture.', spriteUrl: spriteUrl('bellsprout') },
    { id: 70, name: 'Weepinbell', rarity: Rarity.Rare, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'It spits out POISONPOWDER to immobilize the enemy and then finishes it with a spray of ACID.', spriteUrl: spriteUrl('weepinbell') },
    { id: 71, name: 'Victreebel', rarity: Rarity.Legendary, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'Said to live in huge colonies deep in jungles, although no one has ever returned from there.', spriteUrl: spriteUrl('victreebel') },
    // Tentacool line (72-73)
    { id: 72, name: 'Tentacool', rarity: Rarity.Common, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Drifts in shallow seas. Anglers who hook them by accident are often injured by its poison stingers.', spriteUrl: spriteUrl('tentacool') },
    { id: 73, name: 'Tentacruel', rarity: Rarity.Rare, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'The tentacles are normally kept short. On hunts, they are extended to ensnare and immobilize prey.', spriteUrl: spriteUrl('tentacruel') },
    // Geodude line (74-76)
    { id: 74, name: 'Geodude', rarity: Rarity.Common, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Found in fields and mountains. Mistaking them for boulders, people often step or trip on them.', spriteUrl: spriteUrl('geodude') },
    { id: 75, name: 'Graveler', rarity: Rarity.Rare, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Rolls down slopes to move. It rolls over any obstacle without slowing or changing its direction.', spriteUrl: spriteUrl('graveler') },
    { id: 76, name: 'Golem', rarity: Rarity.Legendary, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'Its boulder-like body is extremely hard. It can easily withstand dynamite blasts without damage.', spriteUrl: spriteUrl('golem') },
    // Ponyta line (77-78)
    { id: 77, name: 'Ponyta', rarity: Rarity.Common, type: CreatureType.Fire, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Its hooves are 10 times harder than diamonds. It can trample anything completely flat in little time.', spriteUrl: spriteUrl('ponyta') },
    { id: 78, name: 'Rapidash', rarity: Rarity.Rare, type: CreatureType.Fire, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Very competitive, this POKéMON will chase anything that moves fast in the hopes of racing it.', spriteUrl: spriteUrl('rapidash') },
    // Slowpoke line (79-80)
    { id: 79, name: 'Slowpoke', rarity: Rarity.Common, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Incredibly slow and dopey. It takes 5 seconds for it to feel pain when under attack.', spriteUrl: spriteUrl('slowpoke') },
    { id: 80, name: 'Slowbro', rarity: Rarity.Rare, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'The SHELLDER that is latched onto SLOWPOKE\'s tail is said to feed on the host\'s left over scraps.', spriteUrl: spriteUrl('slowbro') },
    // Magnemite line (81-82)
    { id: 81, name: 'Magnemite', rarity: Rarity.Common, type: CreatureType.Electric, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Uses anti-gravity to stay suspended. Appears without warning and uses THUNDER WAVE and similar moves.', spriteUrl: spriteUrl('magnemite') },
    { id: 82, name: 'Magneton', rarity: Rarity.Rare, type: CreatureType.Electric, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Formed by several MAGNEMITEs linked together. They frequently appear when sunspots flare up.', spriteUrl: spriteUrl('magneton') },
    // Farfetch'd (83)
    { id: 83, name: "Farfetch'd", rarity: Rarity.Rare, type: CreatureType.Wind, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'The sprig of green onions it holds is its weapon. It is used much like a metal sword.', spriteUrl: spriteUrl('farfetchd') },
    // Doduo line (84-85)
    { id: 84, name: 'Doduo', rarity: Rarity.Common, type: CreatureType.Wind, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'A bird that makes up for its poor flying with its fast foot speed. Leaves giant footprints.', spriteUrl: spriteUrl('doduo') },
    { id: 85, name: 'Dodrio', rarity: Rarity.Rare, type: CreatureType.Wind, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Uses its three brains to execute complex plans. While two heads sleep, one head stays awake.', spriteUrl: spriteUrl('dodrio') },
    // Seel line (86-87)
    { id: 86, name: 'Seel', rarity: Rarity.Common, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'The protruding horn on its head is very hard. It is used for bashing through thick ice.', spriteUrl: spriteUrl('seel') },
    { id: 87, name: 'Dewgong', rarity: Rarity.Rare, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Stores thermal energy in its body. Swims at a steady 8 knots even in intensely cold waters.', spriteUrl: spriteUrl('dewgong') },
    // Grimer line (88-89)
    { id: 88, name: 'Grimer', rarity: Rarity.Common, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Appears in filthy areas. Thrives by sucking up polluted sludge that is pumped out of factories.', spriteUrl: spriteUrl('grimer') },
    { id: 89, name: 'Muk', rarity: Rarity.Rare, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Thickly covered with a filthy, vile sludge. It is so toxic, even its footprints contain poison.', spriteUrl: spriteUrl('muk') },
    // Shellder line (90-91)
    { id: 90, name: 'Shellder', rarity: Rarity.Common, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Its hard shell repels any kind of attack. It is vulnerable only when its shell is open.', spriteUrl: spriteUrl('shellder') },
    { id: 91, name: 'Cloyster', rarity: Rarity.Rare, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'When attacked, it launches its horns in quick volleys. Its innards have never been seen.', spriteUrl: spriteUrl('cloyster') },
    // Gastly line (92-94)
    { id: 92, name: 'Gastly', rarity: Rarity.Common, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Almost invisible, this gaseous POKéMON cloaks the target and puts it to sleep without notice.', spriteUrl: spriteUrl('gastly') },
    { id: 93, name: 'Haunter', rarity: Rarity.Rare, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Because of its ability to slip through block walls, it is said to be from another dimension.', spriteUrl: spriteUrl('haunter') },
    { id: 94, name: 'Gengar', rarity: Rarity.Legendary, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'Under a full moon, this POKéMON likes to mimic the shadows of people and laugh at their fright.', spriteUrl: spriteUrl('gengar') },
    // Onix (95)
    { id: 95, name: 'Onix', rarity: Rarity.Rare, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'As it grows, the stone portions of its body harden to become similar to a diamond, but colored black.', spriteUrl: spriteUrl('onix') },
    // Drowzee line (96-97)
    { id: 96, name: 'Drowzee', rarity: Rarity.Common, type: CreatureType.Light, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Puts enemies to sleep then eats their dreams. Occasionally gets sick from eating bad dreams.', spriteUrl: spriteUrl('drowzee') },
    { id: 97, name: 'Hypno', rarity: Rarity.Rare, type: CreatureType.Light, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'When it locks eyes with an enemy, it will use a mix of PSI moves such as HYPNOSIS and CONFUSION.', spriteUrl: spriteUrl('hypno') },
    // Krabby line (98-99)
    { id: 98, name: 'Krabby', rarity: Rarity.Common, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Its pincers are not only powerful weapons, they are used for balance when walking sideways.', spriteUrl: spriteUrl('krabby') },
    { id: 99, name: 'Kingler', rarity: Rarity.Rare, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'The large pincer has 10000 hp of crushing power. However, its huge size makes it unwieldy to use.', spriteUrl: spriteUrl('kingler') },
    // Voltorb line (100-101)
    { id: 100, name: 'Voltorb', rarity: Rarity.Common, type: CreatureType.Electric, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Usually found in power plants. Easily mistaken for a POKé BALL, they have zapped many people.', spriteUrl: spriteUrl('voltorb') },
    { id: 101, name: 'Electrode', rarity: Rarity.Rare, type: CreatureType.Electric, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'It stores electric energy under very high pressure. It often explodes with little or no provocation.', spriteUrl: spriteUrl('electrode') },
    // Exeggcute line (102-103)
    { id: 102, name: 'Exeggcute', rarity: Rarity.Common, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Often mistaken for eggs. When disturbed, they quickly gather and attack in swarms.', spriteUrl: spriteUrl('exeggcute') },
    { id: 103, name: 'Exeggutor', rarity: Rarity.Rare, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Legend has it that on rare occasions, one of its heads will drop off and continue on as an EXEGGCUTE.', spriteUrl: spriteUrl('exeggutor') },
    // Cubone line (104-105)
    { id: 104, name: 'Cubone', rarity: Rarity.Common, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Because it never removes its skull helmet, no one has ever seen this POKéMON\'s real face.', spriteUrl: spriteUrl('cubone') },
    { id: 105, name: 'Marowak', rarity: Rarity.Rare, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'The bone it holds is its key weapon. It throws the bone skillfully like a boomerang to KO targets.', spriteUrl: spriteUrl('marowak') },
    // Hitmonlee (106)
    { id: 106, name: 'Hitmonlee', rarity: Rarity.Rare, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'When in a hurry, its legs lengthen progressively. It runs smoothly with extra long, loping strides.', spriteUrl: spriteUrl('hitmonlee') },
    // Hitmonchan (107)
    { id: 107, name: 'Hitmonchan', rarity: Rarity.Rare, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'While apparently doing nothing, it fires punches in lightning fast volleys that are impossible to see.', spriteUrl: spriteUrl('hitmonchan') },
    // Lickitung (108)
    { id: 108, name: 'Lickitung', rarity: Rarity.Rare, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Its tongue can be extended like a chameleon\'s. It leaves a tingling sensation when it licks enemies.', spriteUrl: spriteUrl('lickitung') },
    // Koffing line (109-110)
    { id: 109, name: 'Koffing', rarity: Rarity.Common, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Because it stores several kinds of toxic gases in its body, it is prone to exploding without warning.', spriteUrl: spriteUrl('koffing') },
    { id: 110, name: 'Weezing', rarity: Rarity.Rare, type: CreatureType.Dark, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Where two kinds of poison gases meet, 2 KOFFINGs can fuse into a WEEZING over many years.', spriteUrl: spriteUrl('weezing') },
    // Rhyhorn line (111-112)
    { id: 111, name: 'Rhyhorn', rarity: Rarity.Common, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Its massive bones are 1000 times harder than human bones. It can easily knock a trailer flying.', spriteUrl: spriteUrl('rhyhorn') },
    { id: 112, name: 'Rhydon', rarity: Rarity.Rare, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Protected by an armor-like hide, it is capable of living in molten lava of 3,600 degrees.', spriteUrl: spriteUrl('rhydon') },
    // Chansey (113)
    { id: 113, name: 'Chansey', rarity: Rarity.Legendary, type: CreatureType.Light, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'A rare and elusive POKéMON that is said to bring happiness to those who manage to get it.', spriteUrl: spriteUrl('chansey') },
    // Tangela (114)
    { id: 114, name: 'Tangela', rarity: Rarity.Rare, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'The whole body is swathed with wide vines that are similar to seaweed. Its vines shake as it walks.', spriteUrl: spriteUrl('tangela') },
    // Kangaskhan (115)
    { id: 115, name: 'Kangaskhan', rarity: Rarity.Legendary, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'The infant rarely ventures out of its mother\'s protective pouch until it is 3 years old.', spriteUrl: spriteUrl('kangaskhan') },
    // Horsea line (116-117)
    { id: 116, name: 'Horsea', rarity: Rarity.Common, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Known to shoot down flying bugs with precision blasts of ink from the surface of the water.', spriteUrl: spriteUrl('horsea') },
    { id: 117, name: 'Seadra', rarity: Rarity.Rare, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Capable of swimming backwards by rapidly flapping its wing-like pectoral fins and stout tail.', spriteUrl: spriteUrl('seadra') },
    // Goldeen line (118-119)
    { id: 118, name: 'Goldeen', rarity: Rarity.Common, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'Its tail fin billows like an elegant ballroom dress, giving it the nickname of the Water Queen.', spriteUrl: spriteUrl('goldeen') },
    { id: 119, name: 'Seaking', rarity: Rarity.Rare, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'In the autumn spawning season, they can be seen swimming powerfully up rivers and creeks.', spriteUrl: spriteUrl('seaking') },
    // Staryu line (120-121)
    { id: 120, name: 'Staryu', rarity: Rarity.Common, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'An enigmatic POKéMON that can effortlessly regenerate any appendage it loses in battle.', spriteUrl: spriteUrl('staryu') },
    { id: 121, name: 'Starmie', rarity: Rarity.Rare, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Its central core glows with the seven colors of the rainbow. Some people value the core as a gem.', spriteUrl: spriteUrl('starmie') },
    // Mr. Mime (122)
    { id: 122, name: 'Mr. Mime', rarity: Rarity.Rare, type: CreatureType.Light, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'If interrupted while it is miming, it will slap around the offender with its broad hands.', spriteUrl: spriteUrl('mr-mime') },
    // Scyther (123)
    { id: 123, name: 'Scyther', rarity: Rarity.Rare, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'With ninja-like agility and speed, it can create the illusion that there is more than one.', spriteUrl: spriteUrl('scyther') },
    // Jynx (124)
    { id: 124, name: 'Jynx', rarity: Rarity.Rare, type: CreatureType.Light, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'It seductively wiggles its hips as it walks. It can cause people to dance in unison with it.', spriteUrl: spriteUrl('jynx') },
    // Electabuzz (125)
    { id: 125, name: 'Electabuzz', rarity: Rarity.Rare, type: CreatureType.Electric, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Normally found near power plants, they can wander away and cause major blackouts in cities.', spriteUrl: spriteUrl('electabuzz') },
    // Magmar (126)
    { id: 126, name: 'Magmar', rarity: Rarity.Rare, type: CreatureType.Fire, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Its body always burns with an orange glow that enables it to hide perfectly among flames.', spriteUrl: spriteUrl('magmar') },
    // Pinsir (127)
    { id: 127, name: 'Pinsir', rarity: Rarity.Rare, type: CreatureType.Nature, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'If it fails to crush the victim in its pincers, it will swing it around and toss it hard.', spriteUrl: spriteUrl('pinsir') },
    // Tauros (128)
    { id: 128, name: 'Tauros', rarity: Rarity.Rare, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'When it targets an enemy, it charges furiously while whipping its body with its long tails.', spriteUrl: spriteUrl('tauros') },
    // Magikarp line (129-130)
    { id: 129, name: 'Magikarp', rarity: Rarity.Common, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 100, evoThreshold2: 300, description: 'In the distant past, it was somewhat stronger than the horribly weak descendants that exist today.', spriteUrl: spriteUrl('magikarp') },
    { id: 130, name: 'Gyarados', rarity: Rarity.Legendary, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'Rarely seen in the wild. Huge and vicious, it is capable of destroying entire cities in a rage.', spriteUrl: spriteUrl('gyarados') },
    // Lapras (131)
    { id: 131, name: 'Lapras', rarity: Rarity.Legendary, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'A POKéMON that has been overhunted almost to extinction. It can ferry people across the water.', spriteUrl: spriteUrl('lapras') },
    // Ditto (132)
    { id: 132, name: 'Ditto', rarity: Rarity.Rare, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Capable of copying an enemy\'s genetic code to instantly transform itself into a duplicate of the enemy.', spriteUrl: spriteUrl('ditto') },
    // Eevee line (133-136)
    { id: 133, name: 'Eevee', rarity: Rarity.Rare, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Its genetic code is irregular. It may mutate if it is exposed to radiation from element stones.', spriteUrl: spriteUrl('eevee') },
    { id: 134, name: 'Vaporeon', rarity: Rarity.Legendary, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'Lives close to water. Its long tail is ridged with a fin which is often mistaken for a mermaid\'s.', spriteUrl: spriteUrl('vaporeon') },
    { id: 135, name: 'Jolteon', rarity: Rarity.Legendary, type: CreatureType.Electric, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'It accumulates negative ions in the atmosphere to blast out 10000-volt lightning bolts.', spriteUrl: spriteUrl('jolteon') },
    { id: 136, name: 'Flareon', rarity: Rarity.Legendary, type: CreatureType.Fire, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'When storing thermal energy in its body, its temperature could soar to over 1600 degrees.', spriteUrl: spriteUrl('flareon') },
    // Porygon (137)
    { id: 137, name: 'Porygon', rarity: Rarity.Rare, type: CreatureType.Electric, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'A POKéMON that consists entirely of programming code. Capable of moving freely in cyberspace.', spriteUrl: spriteUrl('porygon') },
    // Omanyte line (138-139)
    { id: 138, name: 'Omanyte', rarity: Rarity.Rare, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Although long extinct, in rare cases, it can be genetically resurrected from fossils.', spriteUrl: spriteUrl('omanyte') },
    { id: 139, name: 'Omastar', rarity: Rarity.Legendary, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'A prehistoric POKéMON that died out when its heavy shell made it impossible to catch prey.', spriteUrl: spriteUrl('omastar') },
    // Kabuto line (140-141)
    { id: 140, name: 'Kabuto', rarity: Rarity.Rare, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'A POKéMON that was resurrected from a fossil found in what was once the ocean floor eons ago.', spriteUrl: spriteUrl('kabuto') },
    { id: 141, name: 'Kabutops', rarity: Rarity.Legendary, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'Its sleek shape is perfect for swimming. It slashes prey with its claws and drains the body fluids.', spriteUrl: spriteUrl('kabutops') },
    // Aerodactyl (142)
    { id: 142, name: 'Aerodactyl', rarity: Rarity.Legendary, type: CreatureType.Wind, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'A ferocious, prehistoric POKéMON that goes for the enemy\'s throat with its serrated saw-like fangs.', spriteUrl: spriteUrl('aerodactyl') },
    // Snorlax (143)
    { id: 143, name: 'Snorlax', rarity: Rarity.Legendary, type: CreatureType.Metal, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'Very lazy. Just eats and sleeps. As its rotund bulk builds, it becomes steadily more slothful.', spriteUrl: spriteUrl('snorlax') },
    // Articuno (144)
    { id: 144, name: 'Articuno', rarity: Rarity.Legendary, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'A legendary bird POKéMON that is said to appear to doomed people who are lost in icy mountains.', spriteUrl: spriteUrl('articuno') },
    // Zapdos (145)
    { id: 145, name: 'Zapdos', rarity: Rarity.Legendary, type: CreatureType.Electric, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'A legendary bird POKéMON that is said to appear from clouds while dropping enormous lightning bolts.', spriteUrl: spriteUrl('zapdos') },
    // Moltres (146)
    { id: 146, name: 'Moltres', rarity: Rarity.Legendary, type: CreatureType.Fire, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'Known as the legendary bird of fire. Every flap of its wings creates a dazzling flash of flames.', spriteUrl: spriteUrl('moltres') },
    // Dratini line (147-149)
    { id: 147, name: 'Dratini', rarity: Rarity.Rare, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 200, evoThreshold2: 600, description: 'Long considered a mythical POKéMON until recently when a small colony was found living underwater.', spriteUrl: spriteUrl('dratini') },
    { id: 148, name: 'Dragonair', rarity: Rarity.Legendary, type: CreatureType.Water, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'A mystical POKéMON that exudes a gentle aura. Has the ability to change climate conditions.', spriteUrl: spriteUrl('dragonair') },
    { id: 149, name: 'Dragonite', rarity: Rarity.Legendary, type: CreatureType.Wind, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'An extremely rarely seen marine POKéMON. Its intelligence is said to match that of humans.', spriteUrl: spriteUrl('dragonite') },
    // Mewtwo (150)
    { id: 150, name: 'Mewtwo', rarity: Rarity.Legendary, type: CreatureType.Light, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'It was created by a scientist after years of horrific gene splicing and DNA engineering experiments.', spriteUrl: spriteUrl('mewtwo') },
    // Mew (151)
    { id: 151, name: 'Mew', rarity: Rarity.Legendary, type: CreatureType.Light, pixelColors: EMPTY_COLORS, pixelSprite: EMPTY_SPRITE, evoThreshold1: 500, evoThreshold2: 1500, description: 'So rare that it is still said to be a mirage by many experts. Only a few people have seen it worldwide.', spriteUrl: spriteUrl('mew') },
];
