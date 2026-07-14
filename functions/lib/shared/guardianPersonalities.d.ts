/**
 * Guardian Personality Templates
 *
 * Defines the voice and tone for each of the 8 Guardian types across 3 escalation levels:
 * - Morning: Helpful, peppy, slightly passive-aggressive
 * - Afternoon: Impatient, concerned, Duolingo-style questioning
 * - Evening: Desperate, guilt-tripping, packing bags
 */
export type CreatureType = 'Fire' | 'Water' | 'Leaf' | 'Electric' | 'Wind' | 'Metal' | 'Light' | 'Dark';
export type NudgeLevel = 'morning' | 'afternoon' | 'evening';
export interface NudgeTemplate {
    subject: string;
    preview: string;
    body: string;
}
export interface PersonalityTemplate {
    type: CreatureType;
    personality: string;
    morning: NudgeTemplate[];
    afternoon: NudgeTemplate[];
    evening: NudgeTemplate[];
}
export declare const GUARDIAN_PERSONALITIES: Record<CreatureType, PersonalityTemplate>;
/**
 * Get personality template for a creature type
 */
export declare function getPersonalityTemplate(creatureType: CreatureType): PersonalityTemplate;
/**
 * Get nudge template for a specific personality and level (randomly selects one of the 3 variants)
 */
export declare function getNudgeTemplate(creatureType: CreatureType, nudgeLevel: NudgeLevel): NudgeTemplate;
//# sourceMappingURL=guardianPersonalities.d.ts.map