"use strict";
/**
 * User Service
 *
 * Handles MongoDB queries for user game data.
 * Used by Cloud Functions to fetch and update user information.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const admin = __importStar(require("firebase-admin"));
class UserService {
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
    async getUserGameData(userId) {
        try {
            const doc = await this.db.collection('userGameData').doc(userId).get();
            if (!doc.exists) {
                return null;
            }
            return doc.data();
        }
        catch (error) {
            console.error(`Error fetching game data for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Get all users who need email nudges at a specific time
     * Filters by timezone and email notification settings
     */
    async getUsersForNudge(timezones, nudgeLevel) {
        try {
            const notificationField = `emailNotifications.${nudgeLevel}`;
            const snapshot = await this.db.collection('userGameData')
                .where('timezone', 'in', timezones)
                .where('emailNotifications.enabled', '==', true)
                .where(notificationField, '==', true)
                .where('dailyMissions.completed', '==', false)
                .get();
            const users = [];
            snapshot.forEach(doc => {
                users.push({
                    ...doc.data(),
                    _id: doc.id
                });
            });
            return users;
        }
        catch (error) {
            console.error('Error fetching users for nudge:', error);
            throw error;
        }
    }
    /**
     * Update nudge tracking after sending an email
     */
    async updateNudgeSent(userId, nudgeLevel) {
        try {
            const now = new Date();
            await this.db.collection('userGameData').doc(userId).update({
                'dailyMissions.nudgesSent': admin.firestore.FieldValue.increment(1),
                'dailyMissions.lastNudgeSentAt': now,
                'metrics.emailsSent': admin.firestore.FieldValue.increment(1)
            });
            console.log(`Updated nudge tracking for user ${userId} (${nudgeLevel})`);
        }
        catch (error) {
            console.error(`Error updating nudge tracking for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Update email metrics (opens/clicks)
     */
    async updateEmailMetrics(userId, metric) {
        try {
            const field = metric === 'open' ? 'metrics.emailsOpened' : 'metrics.emailsClicked';
            await this.db.collection('userGameData').doc(userId).update({
                [field]: admin.firestore.FieldValue.increment(1)
            });
            console.log(`Updated ${metric} metric for user ${userId}`);
        }
        catch (error) {
            console.error(`Error updating ${metric} metric for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Record conversion (mission completed after email nudge)
     */
    async recordConversion(userId, nudgeType) {
        try {
            const conversionField = `metrics.conversions.${nudgeType}`;
            await this.db.collection('userGameData').doc(userId).update({
                [conversionField]: admin.firestore.FieldValue.increment(1)
            });
            console.log(`Recorded ${nudgeType} conversion for user ${userId}`);
        }
        catch (error) {
            console.error(`Error recording conversion for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Check if user completed their daily mission today
     */
    async hasCompletedTodayMission(userId) {
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
        }
        catch (error) {
            console.error(`Error checking mission completion for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Get users with unsubscribed emails (for cleanup)
     */
    async getUsersWithDisabledNotifications() {
        try {
            const snapshot = await this.db.collection('userGameData')
                .where('emailNotifications.enabled', '==', false)
                .get();
            const users = [];
            snapshot.forEach(doc => {
                users.push({
                    ...doc.data(),
                    _id: doc.id
                });
            });
            return users;
        }
        catch (error) {
            console.error('Error fetching users with disabled notifications:', error);
            throw error;
        }
    }
}
exports.UserService = UserService;
// Export singleton instance
exports.userService = new UserService();
//# sourceMappingURL=userService.js.map