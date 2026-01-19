import express, { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import UserGameData from '../models/UserGameData';

const router = Router();

// Middleware to ensure user is authenticated
router.use(authenticateToken);

/**
 * GET /api/analytics/email-metrics
 * Get email notification metrics
 * Admin/analytics endpoint
 */
router.get('/email-metrics', async (req: Request, res: Response) => {
  try {
    // Aggregate metrics across all users
    const pipeline = [
      {
        $group: {
          _id: null,
          totalEmailsSent: { $sum: '$metrics.emailsSent' },
          totalEmailsOpened: { $sum: '$metrics.emailsOpened' },
          totalEmailsClicked: { $sum: '$metrics.emailsClicked' },
          morningConversions: { $sum: '$metrics.conversions.morning' },
          afternoonConversions: { $sum: '$metrics.conversions.afternoon' },
          eveningConversions: { $sum: '$metrics.conversions.evening' },
          totalUsers: { $sum: 1 },
          usersWithEmailsEnabled: {
            $sum: {
              $cond: [{ $eq: ['$emailNotifications.enabled', true] }, 1, 0]
            }
          }
        }
      }
    ];

    const result = await UserGameData.aggregate(pipeline);
    const metrics = result[0] || {
      totalEmailsSent: 0,
      totalEmailsOpened: 0,
      totalEmailsClicked: 0,
      morningConversions: 0,
      afternoonConversions: 0,
      eveningConversions: 0,
      totalUsers: 0,
      usersWithEmailsEnabled: 0
    };

    // Calculate rates
    const openRate = metrics.totalEmailsSent > 0
      ? Math.round((metrics.totalEmailsOpened / metrics.totalEmailsSent) * 100)
      : 0;

    const clickRate = metrics.totalEmailsSent > 0
      ? Math.round((metrics.totalEmailsClicked / metrics.totalEmailsSent) * 100)
      : 0;

    const totalConversions = metrics.morningConversions + metrics.afternoonConversions + metrics.eveningConversions;
    const conversionRate = metrics.totalEmailsSent > 0
      ? Math.round((totalConversions / metrics.totalEmailsSent) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalEmailsSent: metrics.totalEmailsSent,
        totalEmailsOpened: metrics.totalEmailsOpened,
        totalEmailsClicked: metrics.totalEmailsClicked,
        openRate: `${openRate}%`,
        clickRate: `${clickRate}%`,
        conversions: {
          total: totalConversions,
          byTime: {
            morning: metrics.morningConversions,
            afternoon: metrics.afternoonConversions,
            evening: metrics.eveningConversions
          },
          rate: `${conversionRate}%`
        },
        users: {
          total: metrics.totalUsers,
          withEmailsEnabled: metrics.usersWithEmailsEnabled,
          percentage: metrics.totalUsers > 0
            ? Math.round((metrics.usersWithEmailsEnabled / metrics.totalUsers) * 100)
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching email metrics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/user-metrics/:userId
 * Get individual user's email engagement metrics
 */
router.get('/user-metrics/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Verify user can only access their own metrics
    if (req.user?.id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const gameData = await UserGameData.findOne({ userId });

    if (!gameData) {
      return res.status(404).json({ error: 'User game data not found' });
    }

    const { metrics } = gameData;

    // Calculate rates
    const openRate = metrics.emailsSent > 0
      ? Math.round((metrics.emailsOpened / metrics.emailsSent) * 100)
      : 0;

    const clickRate = metrics.emailsSent > 0
      ? Math.round((metrics.emailsClicked / metrics.emailsSent) * 100)
      : 0;

    const totalConversions = metrics.conversions.morning + metrics.conversions.afternoon + metrics.conversions.evening;
    const conversionRate = metrics.emailsSent > 0
      ? Math.round((totalConversions / metrics.emailsSent) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        emailsSent: metrics.emailsSent,
        emailsOpened: metrics.emailsOpened,
        emailsClicked: metrics.emailsClicked,
        openRate: `${openRate}%`,
        clickRate: `${clickRate}%`,
        conversions: {
          total: totalConversions,
          byTime: {
            morning: metrics.conversions.morning,
            afternoon: metrics.conversions.afternoon,
            evening: metrics.conversions.evening
          },
          rate: `${conversionRate}%`
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/streak-insights
 * Get insights about streaks and daily mission completion
 */
router.get('/streak-insights', async (req: Request, res: Response) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: null,
          averageStreak: { $avg: '$currentStreak' },
          averageLongestStreak: { $avg: '$longestStreak' },
          usersWithActiveStreaks: {
            $sum: {
              $cond: [{ $gt: ['$currentStreak', 0] }, 1, 0]
            }
          },
          usersWithCompletedToday: {
            $sum: {
              $cond: [{ $eq: ['$dailyMissions.completed', true] }, 1, 0]
            }
          },
          totalUsers: { $sum: 1 }
        }
      }
    ];

    const result = await UserGameData.aggregate(pipeline);
    const insights = result[0] || {
      averageStreak: 0,
      averageLongestStreak: 0,
      usersWithActiveStreaks: 0,
      usersWithCompletedToday: 0,
      totalUsers: 0
    };

    const completionRate = insights.totalUsers > 0
      ? Math.round((insights.usersWithCompletedToday / insights.totalUsers) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        streaks: {
          averageCurrentStreak: Math.round(insights.averageStreak),
          averageLongestStreak: Math.round(insights.averageLongestStreak),
          usersWithActiveStreaks: insights.usersWithActiveStreaks
        },
        dailyCompletion: {
          usersCompleted: insights.usersWithCompletedToday,
          totalUsers: insights.totalUsers,
          completionRate: `${completionRate}%`
        }
      }
    });
  } catch (error) {
    console.error('Error fetching streak insights:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/guardians
 * Get most popular Guardian types
 */
router.get('/guardians', async (req: Request, res: Response) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$activeCreature.type',
          count: { $sum: 1 },
          averageStreak: { $avg: '$currentStreak' },
          averageLevel: { $avg: '$activeCreature.level' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    const guardians = await UserGameData.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      data: {
        guardians: guardians.map((g: any) => ({
          type: g._id,
          users: g.count,
          averageStreak: Math.round(g.averageStreak),
          averageLevel: Math.round(g.averageLevel * 10) / 10
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching Guardian stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
