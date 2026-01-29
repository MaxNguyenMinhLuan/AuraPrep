/**
 * Guardian Personality Templates
 *
 * Defines the voice and tone for each of the 8 Guardian types across 3 escalation levels:
 * - Morning: Helpful, motivational
 * - Afternoon: Impatient, concerned
 * - Evening: Desperate, guilt-tripping
 */
export type CreatureType = 'Fire' | 'Water' | 'Leaf' | 'Electric' | 'Wind' | 'Metal' | 'Light' | 'Dark';
export type NudgeLevel = 'morning' | 'afternoon' | 'evening';
interface PersonalityTemplate {
    type: CreatureType;
    personality: string;
    morning: {
        subject: string;
        preview: string;
        body: string;
    };
    afternoon: {
        subject: string;
        preview: string;
        body: string;
    };
    evening: {
        subject: string;
        preview: string;
        body: string;
    };
}
export declare const GUARDIAN_PERSONALITIES: Record<CreatureType, PersonalityTemplate>;
/**
 * Get personality template for a creature type
 */
export declare function getPersonalityTemplate(creatureType: CreatureType): PersonalityTemplate;
/**
 * Get nudge template for a specific personality and level
 */
export declare function getNudgeTemplate(creatureType: CreatureType, nudgeLevel: NudgeLevel): {
    subject: string;
    preview: string;
    body: string;
} | {
    subject: string;
    preview: string;
    body: string;
} | {
    subject: string;
    preview: string;
    body: string;
};
export {};
//# sourceMappingURL=guardianPersonalities.d.ts.map