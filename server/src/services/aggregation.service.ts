/**
 * Aggregation Service
 *
 * Runs daily cron jobs to calculate aggregate metrics:
 * - DAU/MAU calculations
 * - Retention rates
 * - Cohort analysis
 * - Performance for investor dashboard
 */

import {
  UserMetrics,
  EngagementEvent,
  DailyCohortMetrics,
  PerformanceLog
} from '../models/Analytics';
import mongoose from 'mongoose';

export class AggregationService {
  /**
   * Calculate daily cohort metrics
   * Should be run once per day at midnight UTC
   */
  static async calculateDailyCohortMetrics(): Promise<void> {
    try {
      console.log('Starting daily cohort metrics calculation...');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get DAU (users who logged in today)
      const dauLogins = await EngagementEvent.distinct('userId', {
        eventType: 'login',
        timestamp: { $gte: today, $lt: tomorrow }
      });
      const dau = dauLogins.length;

      // Get new users (created account today)
      const newUserIds = await UserMetrics.distinct('userId', {
        createdAt: { $gte: today, $lt: tomorrow }
      });
      const newUsers = newUserIds.length;

      // Get returning users (active today but not new)
      const returningUsers = dau - newUsers;

      // Get churned users (active 7+ days ago but not in last 7 days)
      const activeInLast7Days = await UserMetrics.distinct('userId', {
        lastActivityDate: { $gte: sevenDaysAgo }
      });

      const activeEarlier = await UserMetrics.distinct('userId', {
        lastActivityDate: { $lt: sevenDaysAgo }
      });

      const churnedUsers = activeEarlier.length -
        activeEarlier.filter(id => activeInLast7Days.includes(id as any)).length;

      // Calculate session metrics for today
      const logins = await EngagementEvent.find({
        eventType: 'login',
        timestamp: { $gte: today, $lt: tomorrow }
      });

      const logouts = await EngagementEvent.find({
        eventType: 'logout',
        timestamp: { $gte: today, $lt: tomorrow }
      });

      const avgSessionDuration = logins.length > 0
        ? logouts.reduce((sum, e) => sum + (e.eventData?.sessionDurationSeconds || 0), 0) / logins.length / 60
        : 0;

      // Get questions answered today
      const performanceLogs = await PerformanceLog.find({
        timestamp: { $gte: today, $lt: tomorrow }
      });

      const avgQuestionsPerSession = logins.length > 0
        ? performanceLogs.length / logins.length
        : 0;

      const correctAnswers = performanceLogs.filter(p => p.isCorrect).length;
      const avgAccuracy = performanceLogs.length > 0
        ? (correctAnswers / performanceLogs.length) * 100
        : 0;

      // Get missions completed
      const missionsCompleted = await EngagementEvent.countDocuments({
        eventType: 'mission_complete',
        timestamp: { $gte: today, $lt: tomorrow }
      });

      // Get summons
      const summons = await EngagementEvent.countDocuments({
        eventType: 'summon',
        timestamp: { $gte: today, $lt: tomorrow }
      });

      // Get email nudge data
      const nudgeMetrics = await UserMetrics.aggregate([
        {
          $group: {
            _id: null,
            emailsSent: { $sum: '$emailsReceived' },
            conversions: { $sum: '$nudgeConversions' }
          }
        }
      ]);

      const nudgeData = nudgeMetrics[0] || { emailsSent: 0, conversions: 0 };
      const nudgeConversionRate = nudgeData.emailsSent > 0
        ? Math.round((nudgeData.conversions / nudgeData.emailsSent) * 100)
        : 0;

      // Upsert daily metrics
      await DailyCohortMetrics.findOneAndUpdate(
        { date: today },
        {
          dau,
          newUsers,
          returningUsers,
          churned: churnedUsers,
          averageSessionDuration: Math.round(avgSessionDuration),
          averageQuestionsPerSession: Math.round(avgQuestionsPerSession),
          averageAccuracy: Math.round(avgAccuracy),
          totalMissionsCompleted: missionsCompleted,
          totalSummonsPerformed: summons,
          nudgeEmailsSent: nudgeData.emailsSent,
          nudgeConversionRate
        },
        { upsert: true, new: true }
      );

      console.log(`Daily metrics calculated for ${today.toDateString()}: DAU=${dau}, New=${newUsers}`);
    } catch (error) {
      console.error('Error calculating daily cohort metrics:', error);
      throw error;
    }
  }

  /**
   * Recalculate all user metrics in batch
   * Should be run daily after calculateDailyCohortMetrics()
   */
  static async batchUpdateAllUserMetrics(): Promise<void> {
    try {
      console.log('Starting batch user metrics update...');

      const users = await UserMetrics.find().select('userId').lean();
      let processed = 0;
      let errors = 0;

      // Process in batches to avoid memory issues
      const batchSize = 100;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);

        await Promise.allSettled(
          batch.map(async user => {
            try {
              await this.updateUserMetrics(user.userId.toString());
              processed++;
            } catch (err) {
              errors++;
              console.error(`Error updating user ${user.userId}:`, err);
            }
          })
        );

        console.log(`Processed ${Math.min(i + batchSize, users.length)} of ${users.length} users...`);
      }

      console.log(`Batch update complete: ${processed} succeeded, ${errors} failed`);
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }

  /**
   * Update a specific user's metrics (internal use)
   */
  static async updateUserMetrics(userId: string): Promise<void> {
    // Implementation would call AnalyticsService.updateUserMetrics()
    // This is a placeholder for the actual aggregation logic
  }

  /**
   * Calculate retention cohorts
   * Tracks how different user cohorts (by signup date) retain over time
   */
  static async calculateRetentionCohorts(): Promise<void> {
    try {
      console.log('Calculating retention cohorts...');

      const users = await UserMetrics.find().select('userId createdAt lastActivityDate').lean();

      // Group users by signup date
      const cohorts: { [key: string]: { total: number; active: number } } = {};

      for (const user of users) {
        const cohortDate = new Date(user.createdAt);
        cohortDate.setHours(0, 0, 0, 0);
        const cohortKey = cohortDate.toISOString().split('T')[0];

        if (!cohorts[cohortKey]) {
          cohorts[cohortKey] = { total: 0, active: 0 };
        }

        cohorts[cohortKey].total++;

        // Check if active in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        if (user.lastActivityDate > sevenDaysAgo) {
          cohorts[cohortKey].active++;
        }
      }

      // Calculate retention rates
      console.log('Retention by cohort (7-day):', cohorts);
    } catch (error) {
      console.error('Error calculating retention cohorts:', error);
      throw error;
    }
  }

  /**
   * Generate investor pitch metrics
   * Returns key metrics suitable for pitch deck
   */
  static async generateInvestorMetrics() {
    try {
      console.log('Generating investor metrics...');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get latest daily metrics
      const latestDaily = await DailyCohortMetrics.findOne({ date: today }).sort({ date: -1 });

      // Get 7-day and 30-day DAU
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dauLast7 = await DailyCohortMetrics.aggregate([
        { $match: { date: { $gte: sevenDaysAgo, $lte: today } } },
        { $group: { _id: null, avgDAU: { $avg: '$dau' } } }
      ]);

      const dauLast30 = await DailyCohortMetrics.aggregate([
        { $match: { date: { $gte: thirtyDaysAgo, $lte: today } } },
        { $group: { _id: null, avgDAU: { $avg: '$dau' } } }
      ]);

      // Get retention
      const activeUsers = await UserMetrics.countDocuments({
        lastActivityDate: { $gte: sevenDaysAgo }
      });

      const totalUsers = await UserMetrics.countDocuments();

      // Get learning outcomes
      const subtopiAbovePercentile = await mongoose
        .model('SubtopicMetrics')
        .countDocuments({ isAbovePercentile25: true });

      // Get gacha metrics
      const gachaMetrics = await UserMetrics.aggregate([
        {
          $group: {
            _id: null,
            avgSummons: { $avg: '$totalSummons' },
            usersWithEvolutions: { $sum: { $cond: [{ $gt: ['$creatureEvolutionCount', 0] }, 1, 0] } },
            totalEvolutions: { $sum: '$creatureEvolutionCount' }
          }
        }
      ]);

      const gacha = gachaMetrics[0] || {};

      return {
        snapshot_date: new Date().toISOString(),
        user_metrics: {
          total_users: totalUsers,
          active_users_7d: activeUsers,
          dau_current: latestDaily?.dau || 0,
          dau_7d_avg: dauLast7[0]?.avgDAU || 0,
          dau_30d_avg: dauLast30[0]?.avgDAU || 0,
          retention_rate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
        },
        learning_metrics: {
          subtopic_milestones_achieved: subtopiAbovePercentile || 0,
          milestone_penetration: totalUsers > 0 ? Math.round((subtopiAbovePercentile / totalUsers) * 100) : 0
        },
        engagement_metrics: {
          avg_summmons_per_user: Math.round(gacha.avgSummons || 0),
          users_with_evolutions: gacha.usersWithEvolutions || 0,
          evolution_penetration: totalUsers > 0
            ? Math.round(((gacha.usersWithEvolutions || 0) / totalUsers) * 100)
            : 0,
          total_evolutions: gacha.totalEvolutions || 0
        },
        nudge_metrics: {
          daily_nudge_emails: latestDaily?.nudgeEmailsSent || 0,
          nudge_conversion_rate: latestDaily?.nudgeConversionRate || 0
        }
      };
    } catch (error) {
      console.error('Error generating investor metrics:', error);
      throw error;
    }
  }
}
