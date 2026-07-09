// A simple, compute-efficient profanity filter for basic moderation
const BAD_WORDS = [
    'fuck',
    'shit',
    'bitch',
    'asshole',
    'cunt',
    'dick',
    'pussy',
    'cock',
    'slut',
    'whore',
    'nigger',
    'nigga',
    'faggot',
    'retard',
    'cum',
    'porn',
    'sex',
    'rape'
];

/**
 * Checks if a string contains any exact or substring matches for inappropriate words.
 * This uses a very simple and fast algorithm to save compute.
 */
export const containsProfanity = (text: string): boolean => {
    if (!text) return false;
    
    // Convert to lowercase and strip non-alphanumeric chars to prevent simple bypasses (e.g., "f.u.c.k")
    const normalizedText = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Simple substring match for bad words
    return BAD_WORDS.some(word => normalizedText.includes(word));
};
