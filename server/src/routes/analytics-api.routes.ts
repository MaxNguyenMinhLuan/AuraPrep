/**
 * Analytics API Routes
 *
 * Public endpoints for:
 * - User to access their own analytics
 * - Admin/investor dashboard (privacy-compliant aggregate data)
 * - CSV/JSON export for investor pitch decks
 */

import express, { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  UserMetrics,
  PerformanceLog,
  SubtopicMetrics,
  EngagementEvent,
  DailyCohortMetrics,
  SentimentLog
} from '../models/Analytics';
import { AnalyticsService } from '../services/analytics.service';
import mongoose from 'mongoose';

const router = Router();

// ============================================================================
// User Analytics - Users can view their own data
// ============================================================================

/**
 * GET /api/analytics/user/learning
 * Get user's learning progress
 */
router.get('/user/learning', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const progress = await AnalyticsService.getUserLearningProgress(userId);
    return res.status(200).json({ success: true, data: progress });
  } catch (error) {
    console.error('Error fetching learning progress:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/user/engagement
 * Get user's engagement metrics
 */
router.get('/user/engagement', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const engagement = await AnalyticsService.getUserEngagementSummary(userId);
    return res.status(200).json({ success: true, data: engagement });
  } catch (error) {
    console.error('Error fetching engagement:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/user/gacha
 * Get user's gacha economics
 */
router.get('/user/gacha', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const gacha = await AnalyticsService.getUserGachaEconomics(userId);
    return res.status(200).json({ success: true, data: gacha });
  } catch (error) {
    console.error('Error fetching gacha data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/user/performance
 * Get user's recent performance logs
 */
router.get('/user/performance', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const logs = await PerformanceLog.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('-userAnswered -correctAnswer'); // Privacy: hide actual answers

    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching performance logs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// Admin/Investor Dashboard - Aggregate, anonymized data
// ============================================================================

/**
 * GET /api/analytics/dashboard/overview
 * High-level investor metrics
 */
router.get('/dashboard/overview', async (req: Request, res: Response) => {
  try {
    // Basic metrics (no auth required for public dashboard)
    const totalUsers = await UserMetrics.countDocuments();
    const activeUsers = await UserMetrics.countDocuments({
      lastActivityDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const metrics = await UserMetrics.aggregate([
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: '$totalQuestionsAnswered' },
          averageAccuracy: { $avg: '$averageAccuracy' },
          averageStreak: { $avg: '$longestStreak' },
          totalSummons: { $sum: '$totalSummons' },
          averageSessions: { $avg: '$totalSessions' }
        }
      }
    ]);

    const data = metrics[0] || {
      totalQuestions: 0,
      averageAccuracy: 0,
      averageStreak: 0,
      totalSummons: 0,
      averageSessions: 0
    };

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        ...data,
        dau: activeUsers,
        mau: totalUsers // Simplified - would need 30-day tracking
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/dashboard/retention
 * Retention and engagement metrics
 */
router.get('/dashboard/retention', async (req: Request, res: Response) => {
  try {
    const dailyMetrics = await DailyCohortMetrics.find({})
      .sort({ date: -1 })
      .limit(30);

    // Calculate retention metrics
    const latestDay = dailyMetrics[0];
    const oneWeekAgo = dailyMetrics.find(m =>
      (latestDay.date.getTime() - m.date.getTime()) / (1000 * 60 * 60 * 24) === 7
    );

    const retention = {
      dau: latestDay?.dau || 0,
      dau7daysAgo: oneWeekAgo?.dau || 0,
      retentionRate: oneWeekAgo
        ? Math.round((latestDay?.dau || 0) / (oneWeekAgo?.dau || 1) * 100)
        : 0,
      averageNudgeConversionRate: latestDay?.nudgeConversionRate || 0,
      churnRate: latestDay?.churned || 0
    };

    return res.status(200).json({ success: true, data: retention });
  } catch (error) {
    console.error('Error fetching retention:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/dashboard/learning-efficacy
 * Proof of learning outcomes
 */
router.get('/dashboard/learning-efficacy', async (req: Request, res: Response) => {
  try {
    const subtopicMetrics = await SubtopicMetrics.aggregate([
      {
        $group: {
          _id: null,
          usersAbovePercentile25: {
            $sum: { $cond: [{ $eq: ['$isAbovePercentile25', true] }, 1, 0] }
          },
          usersAbovePercentile50: {
            $sum: { $cond: [{ $eq: ['$isAbovePercentile50', true] }, 1, 0] }
          },
          usersAbovePercentile75: {
            $sum: { $cond: [{ $eq: ['$isAbovePercentile75', true] }, 1, 0] }
          },
          averageAccuracyDelta: { $avg: '$accuracyDelta' },
          totalSubtopicProgressions: { $sum: '$accuracyDelta' }
        }
      }
    ]);

    const data = subtopicMetrics[0] || {
      usersAbovePercentile25: 0,
      usersAbovePercentile50: 0,
      usersAbovePercentile75: 0,
      averageAccuracyDelta: 0,
      totalSubtopicProgressions: 0
    };

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching learning efficacy:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/dashboard/gacha-economics
 * Proof that game mechanics drive engagement
 */
router.get('/dashboard/gacha-economics', async (req: Request, res: Response) => {
  try {
    const metrics = await UserMetrics.aggregate([
      {
        $group: {
          _id: null,
          totalSummons: { $sum: '$totalSummons' },
          averageSummonsPerUser: { $avg: '$totalSummons' },
          totalEvolutions: { $sum: '$creatureEvolutionCount' },
          averageCreaturesOwned: { $avg: '$uniqueCreaturesOwned' },
          usersWithEvolutions: {
            $sum: { $cond: [{ $gt: ['$creatureEvolutionCount', 0] }, 1, 0] }
          },
          totalAuraEarned: { $sum: '$totalAuraEarned' },
          totalAuraSpent: { $sum: '$totalAuraSpent' },
          averageAuraBalance: { $avg: { $subtract: ['$totalAuraEarned', '$totalAuraSpent'] } }
        }
      }
    ]);

    const data = metrics[0] || {
      totalSummons: 0,
      averageSummonsPerUser: 0,
      totalEvolutions: 0,
      averageCreaturesOwned: 0,
      usersWithEvolutions: 0,
      totalAuraEarned: 0,
      totalAuraSpent: 0,
      averageAuraBalance: 0
    };

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching gacha economics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/dashboard/nudge-efficacy
 * Email nudge effectiveness
 */
router.get('/dashboard/nudge-efficacy', async (req: Request, res: Response) => {
  try {
    const nudgeMetrics = await EngagementEvent.aggregate([
      { $match: { eventType: 'nudge_click' } },
      {
        $group: {
          _id: '$eventData.nudgeType',
          count: { $sum: 1 },
          averageConversionTime: { $avg: '$eventData.conversionTime' }
        }
      }
    ]);

    // Calculate conversion rate by nudge type
    const emailsSent = await UserMetrics.aggregate([
      {
        $group: {
          _id: null,
          totalEmailsSent: { $sum: '$emailsReceived' },
          totalNudgeClicks: { $sum: '$nudgeConversions' }
        }
      }
    ]);

    const emailData = emailsSent[0] || { totalEmailsSent: 0, totalNudgeClicks: 0 };

    return res.status(200).json({
      success: true,
      data: {
        conversionByTime: nudgeMetrics,
        totalEmailsSent: emailData.totalEmailsSent,
        totalConversions: emailData.totalNudgeClicks,
        overallConversionRate: emailData.totalEmailsSent > 0
          ? Math.round((emailData.totalNudgeClicks / emailData.totalEmailsSent) * 100)
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching nudge efficacy:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// CSV/JSON Export for Investor Pitch Decks
// ============================================================================

/**
 * GET /api/analytics/export/dashboard-metrics
 * Export all dashboard metrics as JSON/CSV
 */
router.get('/export/dashboard-metrics', async (req: Request, res: Response) => {
  try {
    const format = req.query.format as string || 'json';

    // Gather all dashboard data
    const overview = await (async () => {
      const totalUsers = await UserMetrics.countDocuments();
      const activeUsers = await UserMetrics.countDocuments({
        lastActivityDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      return { totalUsers, activeUsers };
    })();

    const learning = await SubtopicMetrics.aggregate([
      {
        $group: {
          _id: null,
          usersAbovePercentile25: { $sum: { $cond: [{ $eq: ['$isAbovePercentile25', true] }, 1, 0] } },
          usersAbovePercentile50: { $sum: { $cond: [{ $eq: ['$isAbovePercentile50', true] }, 1, 0] } }
        }
      }
    ]);

    const gacha = await UserMetrics.aggregate([
      {
        $group: {
          _id: null,
          totalSummons: { $sum: '$totalSummons' },
          usersWithEvolutions: { $sum: { $cond: [{ $gt: ['$creatureEvolutionCount', 0] }, 1, 0] } }
        }
      }
    ]);

    const combinedData = {
      exportDate: new Date().toISOString(),
      users: overview,
      learningEfficacy: learning[0] || {},
      gachaEconomics: gacha[0] || {}
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvContent = `Metric,Value
Total Users,${overview.totalUsers}
Daily Active Users,${overview.activeUsers}
Users Above 25th Percentile,${learning[0]?.usersAbovePercentile25 || 0}
Users Above 50th Percentile,${learning[0]?.usersAbovePercentile50 || 0}
Total Summons,${gacha[0]?.totalSummons || 0}
Users With Evolutions,${gacha[0]?.usersWithEvolutions || 0}
Export Date,${new Date().toISOString()}`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics-export.csv"');
      return res.send(csvContent);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics-export.json"');
      return res.json(combinedData);
    }
  } catch (error) {
    console.error('Error exporting metrics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
