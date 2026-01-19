/**
 * Analytics Models
 *
 * Comprehensive tracking for:
 * - Retention & engagement (DAU/MAU, session depth)
 * - Learning efficacy (accuracy deltas, percentile milestones)
 * - Gacha economics (summoning, evolution, monetization)
 * - Privacy: All data can be anonymized for investor reports
 */

import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================================================
// 1. USER METRICS - Aggregated user-level statistics
// ============================================================================

interface IUserMetrics extends Document {
  userId: Types.ObjectId;
  email: string;

  // Engagement Metrics
  totalQuestionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageAccuracy: number;

  // Streak Data
  currentStreak: number;
  longestStreak: number;
  totalStreakRecoveries: number; // Users who returned after 1+ day lapse
  lastActivityDate: Date;
  lastStreakBreakDate?: Date;

  // Session Data
  totalSessions: number;
  averageSessionDuration: number; // Minutes
  averageQuestionsPerSession: number;

  // Gacha/Summoning
  totalAuraEarned: number;
  totalAuraSpent: number;
  totalSummons: number;
  uniqueCreaturesOwned: number;
  creatureEvolutionCount: number; // Count of creatures at Level 2+

  // Nudge Response
  emailsReceived: number;
  emailsOpened: number;
  nudgeConversions: number; // Missions completed within 2 hours of nudge
  nudgeConversionRate: number; // nudgeConversions / emailsReceived

  // Learning Progress
  subtopicsAboveAverageAccuracy: number; // Subtopics where user > 60% accuracy
  maxAccuracy: number; // Highest accuracy in any subtopic
  minAccuracy: number; // Lowest accuracy

  createdAt: Date;
  updatedAt: Date;
  lastCalculated: Date;
}

const UserMetricsSchema = new Schema<IUserMetrics>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
    email: { type: String, required: true, index: true },
    totalQuestionsAnswered: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    incorrectAnswers: { type: Number, default: 0 },
    averageAccuracy: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalStreakRecoveries: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: Date.now },
    lastStreakBreakDate: { type: Date },
    totalSessions: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 },
    averageQuestionsPerSession: { type: Number, default: 0 },
    totalAuraEarned: { type: Number, default: 0 },
    totalAuraSpent: { type: Number, default: 0 },
    totalSummons: { type: Number, default: 0 },
    uniqueCreaturesOwned: { type: Number, default: 0 },
    creatureEvolutionCount: { type: Number, default: 0 },
    emailsReceived: { type: Number, default: 0 },
    emailsOpened: { type: Number, default: 0 },
    nudgeConversions: { type: Number, default: 0 },
    nudgeConversionRate: { type: Number, default: 0 },
    subtopicsAboveAverageAccuracy: { type: Number, default: 0 },
    maxAccuracy: { type: Number, default: 0 },
    minAccuracy: { type: Number, default: 0 },
    lastCalculated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

UserMetricsSchema.index({ lastActivityDate: 1 });
UserMetricsSchema.index({ currentStreak: 1 });

// ============================================================================
// 2. PERFORMANCE LOGS - Per-question tracking (time series)
// ============================================================================

interface IPerformanceLog extends Document {
  userId: Types.ObjectId;
  subtopicId: string;
  topicId: string;
  questionId: string;
  isCorrect: boolean;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  timeSpentSeconds: number;
  userAnswered: string;
  correctAnswer: string;
  timestamp: Date;
}

const PerformanceLogSchema = new Schema<IPerformanceLog>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    subtopicId: { type: String, required: true, index: true },
    topicId: { type: String, required: true },
    questionId: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    difficultyLevel: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    timeSpentSeconds: { type: Number, default: 0 },
    userAnswered: { type: String },
    correctAnswer: { type: String },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: false }
);

// TTL Index: Auto-delete logs older than 1 year for storage efficiency
PerformanceLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });
PerformanceLogSchema.index({ userId: 1, subtopicId: 1 });

// ============================================================================
// 3. SUBTOPIC METRICS - Per-subtopic accuracy tracking
// ============================================================================

interface ISubtopicMetrics extends Document {
  userId: Types.ObjectId;
  subtopicId: string;
  subtopicName: string;

  // Baseline vs Current
  baselineAccuracy: number; // Accuracy from first 10 questions
  currentAccuracy: number; // Accuracy from last 50 questions
  accuracyDelta: number; // currentAccuracy - baselineAccuracy

  // Milestone Tracking
  isAbovePercentile25: boolean; // Has user moved above 25th percentile?
  movedAbovePercentile25At?: Date;
  isAbovePercentile50: boolean;
  movedAbovePercentile50At?: Date;
  isAbovePercentile75: boolean;
  movedAbovePercentile75At?: Date;

  // Calibration
  totalQuestionsAnswered: number;
  questionsToMoveFromEasyToHard?: number; // Missions until difficulty increased
  currentDifficultyLevel: 'Easy' | 'Medium' | 'Hard';
  difficultyChanges: number;

  // Engagement
  lastAnsweredAt: Date;
  daysActive: number;

  createdAt: Date;
  updatedAt: Date;
}

const SubtopicMetricsSchema = new Schema<ISubtopicMetrics>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    subtopicId: { type: String, required: true },
    subtopicName: { type: String, required: true },
    baselineAccuracy: { type: Number, default: 0 },
    currentAccuracy: { type: Number, default: 0 },
    accuracyDelta: { type: Number, default: 0 },
    isAbovePercentile25: { type: Boolean, default: false },
    movedAbovePercentile25At: { type: Date },
    isAbovePercentile50: { type: Boolean, default: false },
    movedAbovePercentile50At: { type: Date },
    isAbovePercentile75: { type: Boolean, default: false },
    movedAbovePercentile75At: { type: Date },
    totalQuestionsAnswered: { type: Number, default: 0 },
    questionsToMoveFromEasyToHard: { type: Number },
    currentDifficultyLevel: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    difficultyChanges: { type: Number, default: 0 },
    lastAnsweredAt: { type: Date, default: Date.now },
    daysActive: { type: Number, default: 0 }
  },
  { timestamps: true }
);

SubtopicMetricsSchema.index({ userId: 1, subtopicId: 1 }, { unique: true });
SubtopicMetricsSchema.index({ isAbovePercentile25: 1 });

// ============================================================================
// 4. ENGAGEMENT EVENTS - Session and behavioral tracking
// ============================================================================

interface IEngagementEvent extends Document {
  userId: Types.ObjectId;
  eventType: 'login' | 'logout' | 'mission_start' | 'mission_complete' | 'summon' | 'evolution' | 'nudge_click';
  eventData: {
    sessionId?: string;
    questionsAnswered?: number;
    sessionDurationSeconds?: number;
    auraEarned?: number;
    auraSpent?: number;
    creatureId?: number;
    creatureName?: string;
    nudgeType?: 'morning' | 'afternoon' | 'evening';
    conversionTime?: number; // Minutes between nudge and mission completion
  };
  timestamp: Date;
}

const EngagementEventSchema = new Schema<IEngagementEvent>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    eventType: {
      type: String,
      enum: ['login', 'logout', 'mission_start', 'mission_complete', 'summon', 'evolution', 'nudge_click'],
      required: true,
      index: true
    },
    eventData: {
      sessionId: String,
      questionsAnswered: Number,
      sessionDurationSeconds: Number,
      auraEarned: Number,
      auraSpent: Number,
      creatureId: Number,
      creatureName: String,
      nudgeType: { type: String, enum: ['morning', 'afternoon', 'evening'] },
      conversionTime: Number
    },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: false }
);

// TTL Index: Auto-delete events older than 6 months
EngagementEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 15552000 });

// ============================================================================
// 5. DAILY COHORT METRICS - Aggregate daily statistics
// ============================================================================

interface IDailyCohortMetrics extends Document {
  date: Date;
  dau: number; // Daily Active Users
  newUsers: number;
  returningUsers: number;
  churned: number; // Users who were active 7 days ago but not today
  averageSessionDuration: number;
  averageQuestionsPerSession: number;
  averageAccuracy: number;
  totalMissionsCompleted: number;
  totalSummonsPerformed: number;
  nudgeEmailsSent: number;
  nudgeConversionRate: number;
}

const DailyCohortMetricsSchema = new Schema<IDailyCohortMetrics>(
  {
    date: { type: Date, required: true, unique: true, index: true },
    dau: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
    returningUsers: { type: Number, default: 0 },
    churned: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 },
    averageQuestionsPerSession: { type: Number, default: 0 },
    averageAccuracy: { type: Number, default: 0 },
    totalMissionsCompleted: { type: Number, default: 0 },
    totalSummonsPerformed: { type: Number, default: 0 },
    nudgeEmailsSent: { type: Number, default: 0 },
    nudgeConversionRate: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// ============================================================================
// 6. SENTIMENT TRACKING - Optional survey data
// ============================================================================

interface ISentimentLog extends Document {
  userId: Types.ObjectId;
  surveyType: 'sat_dread' | 'motivation' | 'confidence';
  beforeScore: number; // 1-10
  afterScore: number;
  scoreDelta: number;
  hoursActive: number; // Hours of app usage between before & after
  timestamp: Date;
}

const SentimentLogSchema = new Schema<ISentimentLog>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    surveyType: {
      type: String,
      enum: ['sat_dread', 'motivation', 'confidence'],
      required: true
    },
    beforeScore: { type: Number, min: 1, max: 10, required: true },
    afterScore: { type: Number, min: 1, max: 10, required: true },
    scoreDelta: { type: Number, required: true },
    hoursActive: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: false }
);

// ============================================================================
// Exports
// ============================================================================

const UserMetrics = mongoose.model<IUserMetrics>('UserMetrics', UserMetricsSchema);
const PerformanceLog = mongoose.model<IPerformanceLog>('PerformanceLog', PerformanceLogSchema);
const SubtopicMetrics = mongoose.model<ISubtopicMetrics>('SubtopicMetrics', SubtopicMetricsSchema);
const EngagementEvent = mongoose.model<IEngagementEvent>('EngagementEvent', EngagementEventSchema);
const DailyCohortMetrics = mongoose.model<IDailyCohortMetrics>('DailyCohortMetrics', DailyCohortMetricsSchema);
const SentimentLog = mongoose.model<ISentimentLog>('SentimentLog', SentimentLogSchema);

export {
  UserMetrics,
  PerformanceLog,
  SubtopicMetrics,
  EngagementEvent,
  DailyCohortMetrics,
  SentimentLog,
  IUserMetrics,
  IPerformanceLog,
  ISubtopicMetrics,
  IEngagementEvent,
  IDailyCohortMetrics,
  ISentimentLog
};
