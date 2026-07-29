/**
 * Level thresholds at which each creature evolves, keyed by creatureId.
 * Mechanically extracted from INITIAL_CREATURES in the root constants.ts
 * (evolveLevel1/evolveLevel2 fields only — no sprite/name/rarity data, since
 * the nudge job only needs to know how close a creature is to evolving).
 * Creature ids with no entry here are single-stage and never evolve.
 */
export interface EvolutionThreshold {
    evolveLevel1?: number;
    evolveLevel2?: number;
}

export const EVOLUTION_THRESHOLDS: Record<number, EvolutionThreshold> = {
    1: { evolveLevel1: 16, evolveLevel2: 32 },
    2: { evolveLevel1: 16, evolveLevel2: 36 },
    3: { evolveLevel1: 16, evolveLevel2: 36 },
    4: { evolveLevel1: 7, evolveLevel2: 10 },
    5: { evolveLevel1: 7, evolveLevel2: 10 },
    6: { evolveLevel1: 18, evolveLevel2: 36 },
    7: { evolveLevel1: 16, evolveLevel2: 36 },
    8: { evolveLevel1: 16, evolveLevel2: 36 },
    9: { evolveLevel1: 21, evolveLevel2: 36 },
    10: { evolveLevel1: 25, evolveLevel2: 36 },
    11: { evolveLevel1: 16, evolveLevel2: 36 },
    12: { evolveLevel1: 28, evolveLevel2: 40 },
    13: { evolveLevel1: 21, evolveLevel2: 36 },
    14: { evolveLevel1: 25, evolveLevel2: 40 },
    15: { evolveLevel1: 25, evolveLevel2: 40 },
    16: { evolveLevel1: 30, evolveLevel2: 55 },
    17: { evolveLevel1: 20 },
    18: { evolveLevel1: 20 },
    19: { evolveLevel1: 22 },
    20: { evolveLevel1: 30 },
    21: { evolveLevel1: 22 },
    22: { evolveLevel1: 30 },
    23: { evolveLevel1: 30 },
    24: { evolveLevel1: 30 },
    25: { evolveLevel1: 22 },
    26: { evolveLevel1: 24 },
    27: { evolveLevel1: 31 },
    28: { evolveLevel1: 26 },
    29: { evolveLevel1: 28 },
    30: { evolveLevel1: 33 },
    31: { evolveLevel1: 28 },
    32: { evolveLevel1: 35 },
    33: { evolveLevel1: 30 },
    34: { evolveLevel1: 40 },
    35: { evolveLevel1: 37 },
    36: { evolveLevel1: 30 },
    37: { evolveLevel1: 31 },
    38: { evolveLevel1: 34 },
    39: { evolveLevel1: 38 },
    40: { evolveLevel1: 30 },
    41: { evolveLevel1: 26 },
    42: { evolveLevel1: 28 },
    43: { evolveLevel1: 30 },
    44: { evolveLevel1: 35 },
    45: { evolveLevel1: 28 },
    46: { evolveLevel1: 35 },
    47: { evolveLevel1: 42 },
    48: { evolveLevel1: 32 },
    49: { evolveLevel1: 33 },
    50: { evolveLevel1: 30 },
    51: { evolveLevel1: 20 },
    52: { evolveLevel1: 25 },
    53: { evolveLevel1: 40 },
    54: { evolveLevel1: 40 },
};

/**
 * Levels remaining until the next evolution stage for a creature at
 * `currentLevel`, or null if it has no further evolution (either an
 * unlisted single-stage creature, or already past its final threshold).
 */
export function levelsUntilNextEvolution(creatureId: number, currentLevel: number): number | null {
    const thresholds = EVOLUTION_THRESHOLDS[creatureId];
    if (!thresholds) return null;

    const next = [thresholds.evolveLevel1, thresholds.evolveLevel2]
        .filter((lvl): lvl is number => typeof lvl === 'number' && lvl > currentLevel)
        .sort((a, b) => a - b)[0];

    return next === undefined ? null : next - currentLevel;
}
