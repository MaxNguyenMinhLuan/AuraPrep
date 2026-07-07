import { BackupQuestion } from '../models/BackupQuestion';
import { OfficialQuestion } from '../models/OfficialQuestion';
import { QUESTION_BANK } from '../config/backupQuestionBank';

export class QuestionIngestionService {
    /**
     * Seeds the BackupQuestion collection with current generated frontend questions if it is empty.
     */
    static async seedBackupQuestions(): Promise<void> {
        try {
            const count = await BackupQuestion.countDocuments();
            if (count > 0) {
                console.log('✓ BackupQuestion collection already seeded. Count:', count);
                return;
            }

            console.log('Seeding BackupQuestion collection with current frontend questions...');
            const docs = QUESTION_BANK.map(q => ({
                Question: q.Question,
                A: q.A,
                B: q.B,
                C: q.C,
                D: q.D,
                CorrectAns: q.CorrectAns,
                Type: q.Type,
                Difficulty: q.Difficulty,
                Source: q.Source,
                Explanation: q.Explanation,
                GraphData: q.GraphData
            }));

            await BackupQuestion.insertMany(docs);
            console.log(`✅ Successfully seeded ${docs.length} BackupQuestions.`);
        } catch (error) {
            console.error('❌ Failed to seed BackupQuestions:', error);
        }
    }

    /**
     * Ingests official College Board questions from the OpenSAT API.
     */
    static async ingestOfficialQuestions(): Promise<void> {
        console.log(`[${new Date().toISOString()}] Starting official College Board questions ingestion...`);
        try {
            // Fetch Reading & Writing questions (default section)
            const rwResponse = await fetch('https://pinesat.duckdns.org/api/questions');
            if (!rwResponse.ok) {
                throw new Error(`Failed to fetch R/W questions: ${rwResponse.statusText}`);
            }
            const rwQuestions = await rwResponse.json() as any[];

            // Fetch Math questions
            const mathResponse = await fetch('https://pinesat.duckdns.org/api/questions?section=math');
            if (!mathResponse.ok) {
                throw new Error(`Failed to fetch Math questions: ${mathResponse.statusText}`);
            }
            const mathQuestions = await mathResponse.json() as any[];

            const allQuestions = [...rwQuestions, ...mathQuestions];
            console.log(`Fetched ${rwQuestions.length} R/W and ${mathQuestions.length} Math questions (Total: ${allQuestions.length}).`);

            let newCount = 0;
            let updatedCount = 0;

            for (const q of allQuestions) {
                if (!q.id || !q.domain || !q.question || !q.question.choices) {
                    continue; // Skip invalid formats
                }

                const mappedChoices = {
                    A: q.question.choices.A || '',
                    B: q.question.choices.B || '',
                    C: q.question.choices.C || '',
                    D: q.question.choices.D || ''
                };

                const updateData = {
                    domain: q.domain,
                    questionText: q.question.question,
                    paragraph: q.question.paragraph !== 'null' && q.question.paragraph ? q.question.paragraph : undefined,
                    choices: mappedChoices,
                    correctAnswer: q.question.correct_answer,
                    explanation: q.question.explanation !== 'null' && q.question.explanation ? q.question.explanation : undefined,
                    difficulty: q.difficulty || 'Medium',
                    visuals: q.visuals && q.visuals.type !== 'null' ? {
                        type: q.visuals.type,
                        svg_content: q.visuals.svg_content
                    } : undefined
                };

                // Upsert based on originalId (q.id)
                const res = await OfficialQuestion.updateOne(
                    { originalId: q.id },
                    { $set: updateData },
                    { upsert: true }
                );

                if (res.upsertedCount && res.upsertedCount > 0) {
                    newCount++;
                } else if (res.modifiedCount && res.modifiedCount > 0) {
                    updatedCount++;
                }
            }

            console.log(`✅ Ingestion completed. Inserted ${newCount} new questions, updated ${updatedCount} existing questions.`);
        } catch (error) {
            console.error('❌ Official questions ingestion failed:', error);
        }
    }
}
