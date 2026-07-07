import mongoose, { Document, Schema } from 'mongoose';

export interface IOfficialQuestion extends Document {
    originalId: string;
    domain: string;
    questionText: string;
    paragraph?: string;
    choices: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    correctAnswer: string;
    explanation?: string;
    difficulty: string;
    visuals?: {
        type?: string;
        svg_content?: string;
    };
}

const OfficialQuestionSchema = new Schema<IOfficialQuestion>({
    originalId: { type: String, required: true, unique: true, index: true },
    domain: { type: String, required: true, index: true },
    questionText: { type: String, required: true },
    paragraph: { type: String },
    choices: {
        A: { type: String, required: true },
        B: { type: String, required: true },
        C: { type: String, required: true },
        D: { type: String, required: true }
    },
    correctAnswer: { type: String, required: true },
    explanation: { type: String },
    difficulty: { type: String, required: true, index: true },
    visuals: {
        type: { type: String },
        svg_content: { type: String }
    }
}, {
    timestamps: true
});

export const OfficialQuestion = mongoose.model<IOfficialQuestion>('OfficialQuestion', OfficialQuestionSchema);
