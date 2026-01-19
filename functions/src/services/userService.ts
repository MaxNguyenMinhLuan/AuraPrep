/**
 * User Service
 *
 * Handles MongoDB queries for user game data.
 * Used by Cloud Functions to fetch and update user information.
 */

import * as admin from 'firebase-admin';

interface UserGameData {
  _id?: string;
  userId: string;
  email: string;
  timezone: string;
  dailyMissions: {
    date: Date;
    completed: boolean;
    completedAt?: Date;
    nudgesSent: number;
    lastNudgeSentAt?: Date;
  };
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate?: Date;
  activeCreature: {
    creatureId: number;
    name: string;
    type: string;
    level: number;
  };
  totalQuestionsAnswered: number;
  totalCorrect: number;
  auraBalance: number;
  emailNotifications: {
    enabled: boolean;
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  metrics: {
    emailsSent: number;
    emailsOpened: number;
    emailsClicked: number;
    conversions: {
      morning: number;
      afternoon: number;
      evening: number;
    };
  };
}

export class UserService {
  private db: FirebaseFirestore.Firestore;

  constructor() {
    // Initialize Firebase Admin if not already done
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    this.db = admin.firestore();
  }

  /**
   * Get user's game data by user ID
   */
  async getUserGameData(userId: string): Promise<UserGameData | null> {
    try {
      const doc = await this.db.collection('userGameData').doc(userId).get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as UserGameData;
    } catch (error) {
      console.error(`Error fetching game data for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get all users who need email nudges at a specific time
   * Filters by timezone and email notification settings
   */
  async getUsersForNudge(timezones: string[], nudgeLevel: 'morning' | 'afternoon' | 'evening'): Promise<UserGameData[]> {
    try {
      const notificationField = `emailNotifications.${nudgeLevel}`;

      const snapshot = await this.db.collection('userGameData')
        .where('timezone', 'in', timezones)
        .where('emailNotifications.enabled', '==', true)
        .where(notificationField, '==', true)
        .where('dailyMissions.completed', '==', false)
        .get();

      const users: UserGameData[] = [];

      snapshot.forEach(doc => {
        users.push({
          ...doc.data() as UserGameData,
          _id: doc.id
        });
      });

      return users;
    } catch (error) {
      console.error('Error fetching users for nudge:', error);
      throw error;
    }
  }

  /**
   * Update nudge tracking after sending an email
   */
  async updateNudgeSent(userId: string, nudgeLevel: 'morning' | 'afternoon' | 'evening'): Promise<void> {
    try {
      const now = new Date();

      await this.db.collection('userGameData').doc(userId).update({
        'dailyMissions.nudgesSent': admin.firestore.FieldValue.increment(1),
        'dailyMissions.lastNudgeSentAt': now,
        'metrics.emailsSent': admin.firestore.FieldValue.increment(1)
      });

      console.log(`Updated nudge tracking for user ${userId} (${nudgeLevel})`);
    } catch (error) {
      console.error(`Error updating nudge tracking for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update email metrics (opens/clicks)
   */
  async updateEmailMetrics(
    userId: string,
    metric: 'open' | 'click'
  ): Promise<void> {
    try {
      const field = metric === 'open' ? 'metrics.emailsOpened' : 'metrics.emailsClicked';

      await this.db.collection('userGameData').doc(userId).update({
        [field]: admin.firestore.FieldValue.increment(1)
      });

      console.log(`Updated ${metric} metric for user ${userId}`);
    } catch (error) {
      console.error(`Error updating ${metric} metric for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Record conversion (mission completed after email nudge)
   */
  async recordConversion(
    userId: string,
    nudgeType: 'morning' | 'afternoon' | 'evening'
  ): Promise<void> {
    try {
      const conversionField = `metrics.conversions.${nudgeType}`;

      await this.db.collection('userGameData').doc(userId).update({
        [conversionField]: admin.firestore.FieldValue.increment(1)
      });

      console.log(`Recorded ${nudgeType} conversion for user ${userId}`);
    } catch (error) {
      console.error(`Error recording conversion for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Check if user completed their daily mission today
   */
  async hasCompletedTodayMission(userId: string): Promise<boolean> {
    try {
      const userData = await this.getUserGameData(userId);

      if (!userData) {
        return false;
      }

      if (!userData.dailyMissions.completed) {
        return false;
      }

      // Check if completion was today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const completedDate = new Date(userData.dailyMissions.completedAt || 0);
      completedDate.setHours(0, 0, 0, 0);

      return completedDate.getTime() === today.getTime();
    } catch (error) {
      console.error(`Error checking mission completion for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get users with unsubscribed emails (for cleanup)
   */
  async getUsersWithDisabledNotifications(): Promise<UserGameData[]> {
    try {
      const snapshot = await this.db.collection('userGameData')
        .where('emailNotifications.enabled', '==', false)
        .get();

      const users: UserGameData[] = [];

      snapshot.forEach(doc => {
        users.push({
          ...doc.data() as UserGameData,
          _id: doc.id
        });
      });

      return users;
    } catch (error) {
      console.error('Error fetching users with disabled notifications:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();
