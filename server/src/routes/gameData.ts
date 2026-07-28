import express, { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types';
import { authMiddleware } from '../middleware/auth.middleware';
import UserGameData from '../models/UserGameData';
import { User } from '../models/User';

const router = Router();

// Middleware to ensure user is authenticated
router.use(authMiddleware);

// NDA compliance guard - requires signed NDA before accessing game data
router.use(async (req: AuthenticatedRequest, res: Response, next) => {
    try {
        const user = await User.findById(req.user?.id).select('ndaCompliance').lean();
        if (user?.ndaCompliance?.hasSigned !== true) {
            res.status(403).json({
                code: 'NDA_NOT_SIGNED',
                message: 'NDA acceptance required before accessing game data'
            });
            return;
        }
        next();
    } catch (error) {
        console.error('NDA guard error:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
});

/**
 * POST /api/game-data/sync
 * Sync localStorage data to MongoDB (one-time migration or periodic sync)
 */
router.post('/sync', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      profile,
      creatures,
      userTeam,
      tutorialState,
      activeCreatureId,
      auraPoints,
      dailyActivity,
      reviewQueue,
      lastSyncedAt
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
        dailyMissions: {
          date: new Date(),
          completed: false,
          nudgesSent: 0
        },
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
        },
        metrics: {
          emailsSent: 0,
          emailsOpened: 0,
          emailsClicked: 0,
          conversions: {
            morning: 0,
            afternoon: 0,
            evening: 0
          }
        },
        profile,
        creatures,
        userTeam,
        tutorialState,
        reviewQueue,
        dailyActivity
      });
    } else {
      // Conflict Resolution: Check if DB is newer than client's last sync
      if (lastSyncedAt) {
        const clientTime = new Date(lastSyncedAt).getTime();
        const serverTime = new Date(gameData.updatedAt).getTime();
        
        // If DB updated > 2 seconds after the client's last known sync, reject
        if (serverTime > clientTime + 2000) {
          return res.status(409).json({
            error: 'Conflict: Stale data. Database has newer data.',
            gameData
          });
        }
      }

      // Update existing record
      gameData.email = user.email;
      gameData.auraBalance = auraPoints || 500;
      gameData.totalQuestionsAnswered = dailyActivity?.missionsCompleted || 0;
      gameData.profile = profile;
      gameData.creatures = creatures;
      gameData.userTeam = userTeam;
      gameData.tutorialState = tutorialState;
      gameData.reviewQueue = reviewQueue;
      gameData.dailyActivity = dailyActivity;

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
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
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
router.patch('/mission', async (req: AuthenticatedRequest, res: Response) => {
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
router.patch('/preferences', async (req: AuthenticatedRequest, res: Response) => {
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

/**
 * GET /api/game-data/leaderboard
 * Get leaderboard competitors (actual users + dummy fill-ins to reach exactly 19)
 */
router.get('/leaderboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userGameData = await UserGameData.findOne({ userId });
    const currentLeague = userGameData?.profile?.league || 'Bronze';

    // Find other actual users in the same league
    const competitorsGameData = await UserGameData.find({
      userId: { $ne: new mongoose.Types.ObjectId(userId) },
      'profile.league': currentLeague
    }).populate('userId', 'name').lean();

    const actualCompetitors = competitorsGameData.map((doc: any) => ({
      username: doc.userId?.name || doc.email.split('@')[0],
      weeklyGain: doc.profile?.weeklyAuraGain || 0,
      guardianId: doc.activeCreature?.creatureId || 1,
      isUser: false
    }));

    // Generate dummy fill-ins if there are fewer than 19 actual users
    const LEAGUES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'];
    const leagueIndex = LEAGUES.indexOf(currentLeague);
    const baseAura = (leagueIndex !== -1 ? leagueIndex + 1 : 1) * 800;

    const dummyNames = [
      "ShadowStep", "StarGazer", "PixelLord", "MathWhiz24", "StudyBeast", 
      "AuraHunter", "ExamSlayer", "QuestMaster", "LogicKing", "ProDigy",
      "NerdLord", "BookWorm", "Summoner7", "EvoExpert", "ScribeX",
      "Gladiator", "OwlEye", "Thinker", "GrindSet", "PixelKnight",
      "QuestSeeker", "StudyNinja", "MathMagician", "AuraWeaver", "ExamBuster"
    ];

    const usedNames = new Set(actualCompetitors.map(c => c.username));
    const availableDummyNames = dummyNames.filter(name => !usedNames.has(name));

    const finalCompetitors = [...actualCompetitors];
    const needed = 19 - actualCompetitors.length;

    for (let i = 0; i < needed; i++) {
      const name = availableDummyNames[i % availableDummyNames.length] || `Scholar${i + 1}`;
      finalCompetitors.push({
        username: name,
        weeklyGain: Math.floor(Math.random() * baseAura) + (baseAura / 2),
        guardianId: Math.floor(Math.random() * 10) + 1,
        isUser: false
      });
    }

    const limitedCompetitors = finalCompetitors.slice(0, 19);

    return res.status(200).json({
      success: true,
      competitors: limitedCompetitors
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/game-data/friends
 * Add a friend by Academy ID (User ID or Google ID) or email
 */
router.post('/friends', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { friendId } = req.body;
    if (!friendId) {
      return res.status(400).json({ error: 'Academy ID or email is required' });
    }

    const query: any = { email: friendId.toLowerCase().trim() };
    if (mongoose.isValidObjectId(friendId)) {
      query._id = friendId;
    } else {
      query.googleId = friendId;
    }

    // Try to find the friend in the User collection
    const friendUser = await User.findOne({
      $or: [
        mongoose.isValidObjectId(friendId) ? { _id: friendId } : null,
        { googleId: friendId },
        { email: friendId.toLowerCase().trim() }
      ].filter(Boolean) as any[]
    });

    if (!friendUser) {
      return res.status(404).json({ error: 'Seeker not found. Double check the Academy ID or email.' });
    }

    if (friendUser._id.toString() === userId) {
      return res.status(400).json({ error: 'You cannot add yourself as a friend.' });
    }

    // Find current user's game data
    let userGameData = await UserGameData.findOne({ userId });
    if (!userGameData) {
      return res.status(404).json({ error: 'Your game data was not found.' });
    }

    // Initialize friends array if not exists
    if (!userGameData.friends) {
      userGameData.friends = [];
    }

    const friendUserIdStr = friendUser._id.toString();

    if (userGameData.friends.includes(friendUserIdStr)) {
      return res.status(400).json({ error: `You are already friends with ${friendUser.name}.` });
    }

    // Add friend
    userGameData.friends.push(friendUserIdStr);
    await userGameData.save();

    return res.status(200).json({
      success: true,
      message: `Successfully added ${friendUser.name} as a friend!`,
      friends: userGameData.friends
    });
  } catch (error) {
    console.error('Error adding friend:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/game-data/friends
 * Get all friends details
 */
router.get('/friends', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userGameData = await UserGameData.findOne({ userId });
    if (!userGameData || !userGameData.friends || userGameData.friends.length === 0) {
      return res.status(200).json({ success: true, friends: [] });
    }

    // Query UserGameData for all friends
    const friendsGameData = await UserGameData.find({
      userId: { $in: userGameData.friends }
    }).populate('userId', 'name').lean();

    const friendsList = friendsGameData.map((doc: any) => ({
      username: doc.userId?.name || doc.email.split('@')[0],
      weeklyGain: doc.profile?.weeklyAuraGain || 0,
      guardianId: doc.activeCreature?.creatureId || 1,
      isUser: false
    }));

    return res.status(200).json({
      success: true,
      friends: friendsList
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
