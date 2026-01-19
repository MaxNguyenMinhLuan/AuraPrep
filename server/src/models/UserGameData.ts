import mongoose, { Schema, Document, Types } from 'mongoose';

interface IDailyMissions {
  date: Date;
  completed: boolean;
  completedAt?: Date;
  nudgesSent: number;
  lastNudgeSentAt?: Date;
}

interface IActiveCreature {
  creatureId: number;
  name: string;
  type: string; // Fire, Water, Leaf, Electric, Wind, Metal, Light, Dark
  level: number;
}

interface IEmailNotifications {
  enabled: boolean;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
}

interface IMetrics {
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  conversions: {
    morning: number;
    afternoon: number;
    evening: number;
  };
}

interface IUserGameData extends Document {
  userId: Types.ObjectId;
  email: string;
  timezone: string;
  dailyMissions: IDailyMissions;
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate?: Date;
  activeCreature: IActiveCreature;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  auraBalance: number;
  emailNotifications: IEmailNotifications;
  metrics: IMetrics;
  createdAt: Date;
  updatedAt: Date;
}

const DailyMissionsSchema = new Schema<IDailyMissions>({
  date: { type: Date, required: true, default: () => new Date() },
  completed: { type: Boolean, required: true, default: false },
  completedAt: { type: Date },
  nudgesSent: { type: Number, required: true, default: 0 },
  lastNudgeSentAt: { type: Date }
});

const ActiveCreatureSchema = new Schema<IActiveCreature>({
  creatureId: { type: Number, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  level: { type: Number, required: true, default: 1 }
});

const EmailNotificationsSchema = new Schema<IEmailNotifications>({
  enabled: { type: Boolean, required: true, default: true },
  morning: { type: Boolean, required: true, default: true },
  afternoon: { type: Boolean, required: true, default: true },
  evening: { type: Boolean, required: true, default: true }
});

const MetricsSchema = new Schema<IMetrics>({
  emailsSent: { type: Number, required: true, default: 0 },
  emailsOpened: { type: Number, required: true, default: 0 },
  emailsClicked: { type: Number, required: true, default: 0 },
  conversions: {
    morning: { type: Number, required: true, default: 0 },
    afternoon: { type: Number, required: true, default: 0 },
    evening: { type: Number, required: true, default: 0 }
  }
});

const UserGameDataSchema = new Schema<IUserGameData>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
    email: { type: String, required: true, index: true },
    timezone: { type: String, required: true, default: 'America/New_York' },
    dailyMissions: { type: DailyMissionsSchema, required: true },
    currentStreak: { type: Number, required: true, default: 0 },
    longestStreak: { type: Number, required: true, default: 0 },
    lastCompletionDate: { type: Date },
    activeCreature: { type: ActiveCreatureSchema, required: true },
    totalQuestionsAnswered: { type: Number, required: true, default: 0 },
    totalCorrect: { type: Number, required: true, default: 0 },
    auraBalance: { type: Number, required: true, default: 500 },
    emailNotifications: { type: EmailNotificationsSchema, required: true },
    metrics: { type: MetricsSchema, required: true }
  },
  { timestamps: true }
);

// Index for efficient querying by timezone and email notifications
UserGameDataSchema.index({ timezone: 1, 'emailNotifications.enabled': 1 });
UserGameDataSchema.index({ 'dailyMissions.completed': 1, 'dailyMissions.date': 1 });

const UserGameData = mongoose.model<IUserGameData>('UserGameData', UserGameDataSchema);

export default UserGameData;
export type { IUserGameData, IDailyMissions, IActiveCreature, IEmailNotifications, IMetrics };
