
import { UserProfile, DailyMission } from '../types';
import { SUBTOPICS } from '../constants';
import { SKILL_LEVELS } from './mastery';
import { QUESTION_BANK } from '../data/questionBank';

// Helper to shuffle an array
const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const generateDailyMissions = (profile: UserProfile): DailyMission[] => {
    // Audit available topics in the database
    const availableSubtopics = Array.from(new Set(QUESTION_BANK.map(q => q.Type)));

    const subtopicsWithLevels = SUBTOPICS
        .filter(s => availableSubtopics.includes(s)) // ONLY pick topics we have data for
        .map(subtopic => ({
            subtopic,
            level: profile.stats[subtopic]?.level || 'Easy',
        }));

    // If database is very empty, fallback to a few known types just to prevent crash
    if (subtopicsWithLevels.length === 0) {
        subtopicsWithLevels.push({ subtopic: 'Grammar: Punctuation', level: 'Easy' });
    }

    // Sort by level index, ascending (Easy -> Medium -> Hard -> Master)
    subtopicsWithLevels.sort((a, b) => SKILL_LEVELS.indexOf(a.level) - SKILL_LEVELS.indexOf(b.level));
    
    // Take the available topics
    const targetPool = subtopicsWithLevels.map(item => item.subtopic);

    // Shuffle the pool and pick 3
    const selectedSubtopics = shuffleArray(targetPool).slice(0, 3);

    const missionTemplates = [
        { questionCount: 1, reward: 50, xp: 10, title: 'Quick Drill' },
        { questionCount: 2, reward: 150, xp: 25, title: 'Focused Practice' },
        { questionCount: 3, reward: 300, xp: 40, title: 'Deep Dive' },
    ];

    const missions: DailyMission[] = selectedSubtopics.map((subtopic, index) => {
        const template = missionTemplates[index % missionTemplates.length];
        const safeSubtopicId = subtopic.replace(/[^a-zA-Z0-9]/g, '_');
        return {
            id: `${safeSubtopicId}_${new Date().toISOString().split('T')[0]}`,
            title: template.title,
            description: `${template.questionCount} ${subtopic} question${template.questionCount > 1 ? 's' : ''}`,
            subtopic: subtopic,
            questionCount: template.questionCount,
            reward: template.reward,
            xp: template.xp
        };
    });
    
    return missions;
};
