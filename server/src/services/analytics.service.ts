/**
 * Analytics Service
 *
 * Handles all event logging and metric calculations for:
 * - Retention & engagement tracking
 * - Learning efficacy metrics
 * - Gacha economics
 * - Privacy-compliant data collection
 */

import {
  UserMetrics,
  PerformanceLog,
  SubtopicMetrics,
  EngagementEvent,
  DailyCohortMetrics,
  SentimentLog
} from '../models/Analytics';
import { UserGameData } from '../models/UserGameData';
import mongoose, { Types } from 'mongoose';

export interface PerformanceLogInput {
  userId: string;
  subtopicId: string;
  topicId: string;
  questionId: string;
  isCorrect: boolean;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  timeSpentSeconds?: number;
  userAnswered?: string;
  correctAnswer?: string;
}

export interface EngagementEventInput {
  userId: string;
  eventType: 'login' | 'logout' | 'mission_start' | 'mission_complete' | 'summon' | 'evolution' | 'nudge_click';
  eventData?: Record<string, any>;
}

export class AnalyticsService {
  /**
   * Log a question answer
   */
  static async logPerformance(data: PerformanceLogInput): Promise<void> {
    try {
      await PerformanceLog.create({
        userId: new Types.ObjectId(data.userId),
        subtopicId: data.subtopicId,
        topicId: data.topicId,
        questionId: data.questionId,
        isCorrect: data.isCorrect,
        difficultyLevel: data.difficultyLevel,
        timeSpentSeconds: data.timeSpentSeconds || 0,
        userAnswered: data.userAnswered,
        correctAnswer: data.correctAnswer,
        timestamp: new Date()
      });

      // Update user metrics asynchronously
      this.updateUserMetrics(data.userId).catch(err =>
        console.error('Error updating user metrics:', err)
      );

      // Update subtopic metrics asynchronously
      this.updateSubtopicMetrics(data.userId, data.subtopicId).catch(err =>
        console.error('Error updating subtopic metrics:', err)
      );
    } catch (error) {
      console.error('Error logging performance:', error);
      throw error;
    }
  }

  /**
   * Log an engagement event (login, mission complete, summon, etc.)
   */
  static async logEngagementEvent(data: EngagementEventInput): Promise<void> {
    try {
      await EngagementEvent.create({
        userId: new Types.ObjectId(data.userId),
        eventType: data.eventType,
        eventData: data.eventData || {},
        timestamp: new Date()
      });

      // Update user metrics for relevant events
      if (['mission_complete', 'summon', 'evolution'].includes(data.eventType)) {
        this.updateUserMetrics(data.userId).catch(err =>
          console.error('Error updating user metrics:', err)
        );
      }
    } catch (error) {
      console.error('Error logging engagement event:', error);
      throw error;
    }
  }

  /**
   * Log a nudge (email) conversion
   */
  static async logNudgeConversion(
    userId: string,
    nudgeType: 'morning' | 'afternoon' | 'evening',
    conversionTimeMinutes: number
  ): Promise<void> {
    try {
      await EngagementEvent.create({
        userId: new Types.ObjectId(userId),
        eventType: 'nudge_click',
        eventData: {
          nudgeType,
          conversionTime: conversionTimeMinutes
        },
        timestamp: new Date()
      });

      // Update metrics
      const metrics = await UserMetrics.findOne({ userId: new Types.ObjectId(userId) });
      if (metrics) {
        metrics.nudgeConversions += 1;
        metrics.nudgeConversionRate = metrics.nudgeConversions / (metrics.emailsReceived || 1);
        await metrics.save();
      }
    } catch (error) {
      console.error('Error logging nudge conversion:', error);
      throw error;
    }
  }

  /**
   * Update user-level metrics
   */
  static async updateUserMetrics(userId: string): Promise<void> {
    try {
      const objectId = new Types.ObjectId(userId);

      // Get all performance logs for user
      const logs = await PerformanceLog.find({ userId: objectId });

      if (logs.length === 0) return;

      // Calculate metrics
      const correctAnswers = logs.filter(log => log.isCorrect).length;
      const incorrectAnswers = logs.length - correctAnswers;
      const accuracy = logs.length > 0 ? (correctAnswers / logs.length) * 100 : 0;

      // Get engagement data
      const engagementEvents = await EngagementEvent.find({ userId: objectId });
      const sessions = engagementEvents.filter(e => e.eventType === 'login');
      const summons = engagementEvents.filter(e => e.eventType === 'summon');
      const evolutions = engagementEvents.filter(e => e.eventType === 'evolution');
      const nudgeClicks = engagementEvents.filter(e => e.eventType === 'nudge_click');

      // Get aura data from game data
      const gameData = await UserGameData.findOne({ userId: objectId });
      const totalAuraEarned = gameData?.auraBalance || 0;
      const uniqueCreatures = gameData?.creatures?.length || 0;

      // Calculate session statistics
      const avgSessionDuration = sessions.length > 0
        ? engagementEvents
            .filter(e => e.eventType === 'logout')
            .reduce((sum, e) => sum + (e.eventData?.sessionDurationSeconds || 0), 0) / sessions.length
        : 0;

      const avgQuestionsPerSession = sessions.length > 0
        ? logs.length / sessions.length
        : 0;

      // Calculate percentile metrics (subtopics above average)
      const subtopicMetrics = await SubtopicMetrics.find({ userId: objectId });
      const subtopicsAboveAverage = subtopicMetrics.filter(
        m => m.currentAccuracy > 60
      ).length;

      // Update or create metrics
      const metrics = await UserMetrics.findOneAndUpdate(
        { userId: objectId },
        {
          email: gameData?.email || '',
          totalQuestionsAnswered: logs.length,
          correctAnswers,
          incorrectAnswers,
          averageAccuracy: accuracy,
          totalSessions: sessions.length,
          averageSessionDuration: avgSessionDuration / 60, // Convert to minutes
          averageQuestionsPerSession: avgQuestionsPerSession,
          totalAuraEarned,
          totalAuraSpent: summons.length * 150, // Assuming 150 aura per summon
          totalSummons: summons.length,
          uniqueCreaturesOwned: uniqueCreatures,
          creatureEvolutionCount: evolutions.length,
          emailsReceived: 0, // Updated by email system
          nudgeConversions: nudgeClicks.length,
          nudgeConversionRate: 0, // Updated when emails sent
          subtopicsAboveAverageAccuracy: subtopicsAboveAverage,
          maxAccuracy: Math.max(...subtopicMetrics.map(m => m.currentAccuracy || 0), 0),
          minAccuracy: Math.min(...subtopicMetrics.map(m => m.currentAccuracy || 100), 100),
          lastActivityDate: new Date(),
          lastCalculated: new Date()
        },
        { upsert: true, new: true }
      );

      return metrics?.toObject();
    } catch (error) {
      console.error('Error updating user metrics:', error);
      throw error;
    }
  }

  /**
   * Update subtopic-specific metrics
   */
  static async updateSubtopicMetrics(userId: string, subtopicId: string): Promise<void> {
    try {
      const objectId = new Types.ObjectId(userId);

      // Get all logs for this subtopic
      const logs = await PerformanceLog.find({ userId: objectId, subtopicId });

      if (logs.length === 0) return;

      // Calculate baseline (first 10 questions)
      const baseline = logs.slice(0, 10);
      const baselineAccuracy = baseline.length > 0
        ? (baseline.filter(l => l.isCorrect).length / baseline.length) * 100
        : 0;

      // Calculate current (last 50 questions)
      const current = logs.slice(-50);
      const currentAccuracy = current.length > 0
        ? (current.filter(l => l.isCorrect).length / current.length) * 100
        : 0;

      const accuracyDelta = currentAccuracy - baselineAccuracy;

      // Determine percentile milestones (simplified - assumes 50% class avg)
      const classAverage = 50;
      const isAbovePercentile25 = currentAccuracy > classAverage * 0.75; // 37.5%
      const isAbovePercentile50 = currentAccuracy > classAverage; // 50%
      const isAbovePercentile75 = currentAccuracy > classAverage * 1.25; // 62.5%

      // Count difficulty changes
      const easyLogs = logs.filter(l => l.difficultyLevel === 'Easy').length;
      const mediumLogs = logs.filter(l => l.difficultyLevel === 'Medium').length;
      const hardLogs = logs.filter(l => l.difficultyLevel === 'Hard').length;
      const difficultyChanges = (easyLogs > 0 ? 1 : 0) + (mediumLogs > 0 ? 1 : 0) + (hardLogs > 0 ? 1 : 0);

      // Determine current difficulty (most recent questions)
      const recentLogs = logs.slice(-20);
      const currentDifficulty = recentLogs.length > 0
        ? recentLogs[recentLogs.length - 1].difficultyLevel
        : 'Easy';

      // Find when user moved above percentiles
      let movedAbovePercentile25At: Date | undefined;
      let movedAbovePercentile50At: Date | undefined;
      let movedAbovePercentile75At: Date | undefined;

      // Scan through logs to find milestone dates
      let runningCorrect = 0;
      let runningTotal = 0;
      for (const log of logs) {
        runningTotal++;
        if (log.isCorrect) runningCorrect++;

        const runningAccuracy = (runningCorrect / runningTotal) * 100;

        if (runningAccuracy > classAverage * 0.75 && !movedAbovePercentile25At) {
          movedAbovePercentile25At = log.timestamp;
        }
        if (runningAccuracy > classAverage && !movedAbovePercentile50At) {
          movedAbovePercentile50At = log.timestamp;
        }
        if (runningAccuracy > classAverage * 1.25 && !movedAbovePercentile75At) {
          movedAbovePercentile75At = log.timestamp;
        }
      }

      // Find questions to move from Easy to Hard
      const easyToFirstMedium = logs.findIndex(l => l.difficultyLevel === 'Medium');
      const questionsToMoveFromEasyToHard = easyToFirstMedium > 0 ? easyToFirstMedium : undefined;

      // Update or create subtopic metrics
      await SubtopicMetrics.findOneAndUpdate(
        { userId: objectId, subtopicId },
        {
          baselineAccuracy,
          currentAccuracy,
          accuracyDelta,
          isAbovePercentile25,
          movedAbovePercentile25At,
          isAbovePercentile50,
          movedAbovePercentile50At,
          isAbovePercentile75,
          movedAbovePercentile75At,
          totalQuestionsAnswered: logs.length,
          questionsToMoveFromEasyToHard,
          currentDifficultyLevel: currentDifficulty,
          difficultyChanges,
          lastAnsweredAt: logs[logs.length - 1].timestamp,
          daysActive: new Set(logs.map(l => l.timestamp.toDateString())).size
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error updating subtopic metrics:', error);
      throw error;
    }
  }

  /**
   * Log sentiment survey response
   */
  static async logSentimentSurvey(
    userId: string,
    surveyType: 'sat_dread' | 'motivation' | 'confidence',
    beforeScore: number,
    afterScore: number,
    hoursActive: number
  ): Promise<void> {
    try {
      const scoreDelta = afterScore - beforeScore;

      await SentimentLog.create({
        userId: new Types.ObjectId(userId),
        surveyType,
        beforeScore,
        afterScore,
        scoreDelta,
        hoursActive,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging sentiment:', error);
      throw error;
    }
  }

  /**
   * Get user's learning progress summary
   */
  static async getUserLearningProgress(userId: string) {
    try {
      const objectId = new Types.ObjectId(userId);

      const userMetrics = await UserMetrics.findOne({ userId: objectId });
      const subtopicMetrics = await SubtopicMetrics.find({ userId: objectId });

      return {
        overallAccuracy: userMetrics?.averageAccuracy || 0,
        totalQuestionsAnswered: userMetrics?.totalQuestionsAnswered || 0,
        longestStreak: userMetrics?.longestStreak || 0,
        subtopicsAboveAverageAccuracy: userMetrics?.subtopicsAboveAverageAccuracy || 0,
        subtopicsAbovePercentile25: subtopicMetrics.filter(m => m.isAbovePercentile25).length,
        subtopicsAbovePercentile50: subtopicMetrics.filter(m => m.isAbovePercentile50).length,
        subtopicsAbovePercentile75: subtopicMetrics.filter(m => m.isAbovePercentile75).length,
        subtopicDetails: subtopicMetrics.map(m => ({
          subtopicName: m.subtopicName,
          currentAccuracy: m.currentAccuracy,
          accuracyDelta: m.accuracyDelta,
          isAbovePercentile25: m.isAbovePercentile25,
          isAbovePercentile50: m.isAbovePercentile50,
          totalQuestions: m.totalQuestionsAnswered
        }))
      };
    } catch (error) {
      console.error('Error getting learning progress:', error);
      throw error;
    }
  }

  /**
   * Get user's engagement summary
   */
  static async getUserEngagementSummary(userId: string) {
    try {
      const objectId = new Types.ObjectId(userId);
      const metrics = await UserMetrics.findOne({ userId: objectId });

      return {
        currentStreak: metrics?.currentStreak || 0,
        longestStreak: metrics?.longestStreak || 0,
        totalSessions: metrics?.totalSessions || 0,
        averageSessionDuration: metrics?.averageSessionDuration || 0,
        lastActivityDate: metrics?.lastActivityDate,
        emailsReceived: metrics?.emailsReceived || 0,
        nudgeConversionRate: metrics?.nudgeConversionRate || 0
      };
    } catch (error) {
      console.error('Error getting engagement summary:', error);
      throw error;
    }
  }

  /**
   * Get user's gacha economics summary
   */
  static async getUserGachaEconomics(userId: string) {
    try {
      const objectId = new Types.ObjectId(userId);
      const metrics = await UserMetrics.findOne({ userId: objectId });

      return {
        totalAuraEarned: metrics?.totalAuraEarned || 0,
        totalAuraSpent: metrics?.totalAuraSpent || 0,
        auraBalance: (metrics?.totalAuraEarned || 0) - (metrics?.totalAuraSpent || 0),
        totalSummons: metrics?.totalSummons || 0,
        uniqueCreaturesOwned: metrics?.uniqueCreaturesOwned || 0,
        evolutionCount: metrics?.creatureEvolutionCount || 0,
        averageAuraPerSession: metrics?.totalAuraEarned && metrics?.totalSessions
          ? metrics.totalAuraEarned / metrics.totalSessions
          : 0
      };
    } catch (error) {
      console.error('Error getting gacha economics:', error);
      throw error;
    }
  }
}
