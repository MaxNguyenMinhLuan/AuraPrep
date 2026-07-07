import mongoose, { Document, Schema } from 'mongoose';

export interface IBackupQuestion extends Document {
    Question: string;
    A: string;
    B: string;
    C: string;
    D: string;
    CorrectAns: string;
    Type: string;
    Difficulty: string;
    Source?: string;
    Explanation?: string;
    GraphData?: Schema.Types.Mixed;
}

const BackupQuestionSchema = new Schema<IBackupQuestion>({
    Question: { type: String, required: true },
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true },
    CorrectAns: { type: String, required: true },
    Type: { type: String, required: true, index: true },
    Difficulty: { type: String, required: true, index: true },
    Source: { type: String },
    Explanation: { type: String },
    GraphData: { type: Schema.Types.Mixed }
}, {
    timestamps: true
});

export const BackupQuestion = mongoose.model<IBackupQuestion>('BackupQuestion', BackupQuestionSchema);
