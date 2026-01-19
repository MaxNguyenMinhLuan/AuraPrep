import express, { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import UserGameData from '../models/UserGameData';
import { User } from '../models/User';

const router = Router();

// Middleware to ensure user is authenticated
router.use(authenticateToken);

/**
 * POST /api/game-data/sync
 * Sync localStorage data to MongoDB (one-time migration or periodic sync)
 */
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      profile,
      creatures,
      activeCreatureId,
      auraPoints,
      dailyActivity,
      reviewQueue
    } = req.body;

    // Get user info from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get active creature data for display
    const activeCreature = creatures?.find((c: any) => c.id === activeCreatureId);

    // Create or update UserGameData
    let gameData = await UserGameData.findOne({ userId });

    if (!gameData) {
      gameData = new UserGameData({
        userId,
        email: user.email,
        timezone: user.timezone || 'America/New_York',
        activeCreature: activeCreature ? {
          creatureId: activeCreature.id,
          name: activeCreature.name,
          type: activeCreature.type,
          level: activeCreature.level || 1
        } : {
          creatureId: 1,
          name: 'Charmander',
          type: 'Fire',
          level: 1
        },
        totalQuestionsAnswered: dailyActivity?.missionsCompleted || 0,
        auraBalance: auraPoints || 500,
        emailNotifications: {
          enabled: user.emailNotificationsEnabled !== false,
          morning: true,
          afternoon: true,
          evening: true
        }
      });
    } else {
      // Update existing record
      gameData.email = user.email;
      gameData.auraBalance = auraPoints || 500;
      gameData.totalQuestionsAnswered = dailyActivity?.missionsCompleted || 0;

      if (activeCreature) {
        gameData.activeCreature = {
          creatureId: activeCreature.id,
          name: activeCreature.name,
          type: activeCreature.type,
          level: activeCreature.level || 1
        };
      }
    }

    await gameData.save();

    return res.status(200).json({
      message: 'Game data synced successfully',
      gameData
    });
  } catch (error) {
    console.error('Error syncing game data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/game-data
 * Fetch user's game data from MongoDB
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const gameData = await UserGameData.findOne({ userId });

    if (!gameData) {
      return res.status(404).json({ error: 'Game data not found' });
    }

    return res.status(200).json(gameData);
  } catch (error) {
    console.error('Error fetching game data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/game-data/mission
 * Update daily mission completion status
 */
router.patch('/mission', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { completed } = req.body;

    const gameData = await UserGameData.findOne({ userId });
    if (!gameData) {
      return res.status(404).json({ error: 'Game data not found' });
    }

    // Update mission completion
    gameData.dailyMissions.completed = completed;
    if (completed) {
      gameData.dailyMissions.completedAt = new Date();
      gameData.lastCompletionDate = new Date();
      // Reset nudges sent for next day
      gameData.dailyMissions.nudgesSent = 0;
    }

    await gameData.save();

    return res.status(200).json({
      message: 'Mission status updated',
      gameData
    });
  } catch (error) {
    console.error('Error updating mission status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/game-data/preferences
 * Update email notification preferences
 */
router.patch('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { emailNotifications, timezone } = req.body;

    const gameData = await UserGameData.findOne({ userId });
    if (!gameData) {
      return res.status(404).json({ error: 'Game data not found' });
    }

    // Update preferences
    if (emailNotifications) {
      gameData.emailNotifications = {
        ...gameData.emailNotifications,
        ...emailNotifications
      };
    }

    if (timezone) {
      gameData.timezone = timezone;
      // Also update User model
      await User.findByIdAndUpdate(userId, { timezone });
    }

    await gameData.save();

    return res.status(200).json({
      message: 'Preferences updated',
      gameData
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/game-data/nudge
 * Update nudge tracking (called by Cloud Functions)
 * @internal - Used by Firebase Cloud Functions
 */
router.patch('/nudge', async (req: Request, res: Response) => {
  try {
    const { userId, nudgeLevel } = req.body;

    const gameData = await UserGameData.findOne({ userId });
    if (!gameData) {
      return res.status(404).json({ error: 'Game data not found' });
    }

    // Increment nudges sent
    gameData.dailyMissions.nudgesSent = Math.min(3, gameData.dailyMissions.nudgesSent + 1);
    gameData.dailyMissions.lastNudgeSentAt = new Date();
    gameData.metrics.emailsSent += 1;

    await gameData.save();

    return res.status(200).json({
      message: 'Nudge tracking updated',
      gameData
    });
  } catch (error) {
    console.error('Error updating nudge tracking:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/game-data/metrics
 * Update email metrics (opens/clicks)
 * @internal - Used by SendGrid webhooks
 */
router.patch('/metrics', async (req: Request, res: Response) => {
  try {
    const { userId, metric, value } = req.body;

    const gameData = await UserGameData.findOne({ userId });
    if (!gameData) {
      return res.status(404).json({ error: 'Game data not found' });
    }

    // Update specific metric
    if (metric === 'open') {
      gameData.metrics.emailsOpened += value || 1;
    } else if (metric === 'click') {
      gameData.metrics.emailsClicked += value || 1;
    } else if (metric === 'conversion') {
      const { nudgeType } = req.body;
      if (nudgeType === 'morning') {
        gameData.metrics.conversions.morning += 1;
      } else if (nudgeType === 'afternoon') {
        gameData.metrics.conversions.afternoon += 1;
      } else if (nudgeType === 'evening') {
        gameData.metrics.conversions.evening += 1;
      }
    }

    await gameData.save();

    return res.status(200).json({
      message: 'Metrics updated',
      gameData
    });
  } catch (error) {
    console.error('Error updating metrics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
