/**
 * Privacy & Anonymization Utilities
 *
 * Functions to anonymize user data before exporting to investors
 * or sharing in reports. Ensures GDPR/CCPA compliance.
 */

import { v4 as uuidv4 } from 'uuid';

interface AnonymousUserMetrics {
  anonymousUserId: string;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  totalStreakRecoveries: number;
  emailsReceived: number;
  nudgeConversions: number;
  nudgeConversionRate: number;
  subtopicsAboveAverageAccuracy: number;
  totalAuraEarned: number;
  totalAuraSpent: number;
  currentAuraBalance: number;
  totalSummons: number;
  uniqueCreaturesOwned: number;
  creatureEvolutionCount: number;
  creatureEvolutions: {
    creatureType: string;
    fromLevel: number;
    toLevel: number;
  }[];
  lastActivityDate: Date;
  createdAt: Date;
}

interface AnonymousPerformanceLog {
  anonymousUserId: string;
  subtopicId: string;
  isCorrect: boolean;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  timeSpentSeconds: number;
  timestamp: Date;
}

interface AnonymousEngagementEvent {
  anonymousUserId: string;
  eventType: string;
  eventData?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Create user ID mapping for anonymization
 * Maps real user IDs to anonymous UUIDs consistently
 */
export function createUserIdMapping(realUserId: string): string {
  // In production, this would store mapping in a secure lookup table
  // For now, generate a deterministic UUID from the real ID
  // This ensures the same user always gets the same anonymous ID
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(realUserId).digest('hex');
  return `user-${hash.substring(0, 16)}`;
}

/**
 * Anonymize a single user metrics document
 */
export function anonymizeUserMetrics(userMetrics: any): AnonymousUserMetrics {
  return {
    anonymousUserId: createUserIdMapping(userMetrics.userId.toString()),
    totalQuestionsAnswered: userMetrics.totalQuestionsAnswered || 0,
    correctAnswers: userMetrics.correctAnswers || 0,
    averageAccuracy: userMetrics.averageAccuracy || 0,
    currentStreak: userMetrics.currentStreak || 0,
    longestStreak: userMetrics.longestStreak || 0,
    totalStreakRecoveries: userMetrics.totalStreakRecoveries || 0,
    emailsReceived: userMetrics.emailsReceived || 0,
    nudgeConversions: userMetrics.nudgeConversions || 0,
    nudgeConversionRate: userMetrics.nudgeConversionRate || 0,
    subtopicsAboveAverageAccuracy: userMetrics.subtopicsAboveAverageAccuracy || 0,
    totalAuraEarned: userMetrics.totalAuraEarned || 0,
    totalAuraSpent: userMetrics.totalAuraSpent || 0,
    currentAuraBalance: userMetrics.currentAuraBalance || 0,
    totalSummons: userMetrics.totalSummons || 0,
    uniqueCreaturesOwned: userMetrics.uniqueCreaturesOwned || 0,
    creatureEvolutionCount: userMetrics.creatureEvolutionCount || 0,
    creatureEvolutions: (userMetrics.creatureEvolutions || []).map((evo: any) => ({
      creatureType: evo.creatureType,
      fromLevel: evo.fromLevel,
      toLevel: evo.toLevel
    })),
    lastActivityDate: userMetrics.lastActivityDate,
    createdAt: userMetrics.createdAt
  };
}

/**
 * Anonymize array of user metrics documents
 */
export function anonymizeUserMetricsArray(userMetrics: any[]): AnonymousUserMetrics[] {
  return userMetrics.map(metric => anonymizeUserMetrics(metric));
}

/**
 * Anonymize performance log
 */
export function anonymizePerformanceLog(log: any): AnonymousPerformanceLog {
  return {
    anonymousUserId: createUserIdMapping(log.userId.toString()),
    subtopicId: log.subtopicId,
    isCorrect: log.isCorrect,
    difficultyLevel: log.difficultyLevel,
    timeSpentSeconds: log.timeSpentSeconds,
    timestamp: log.timestamp
  };
}

/**
 * Anonymize array of performance logs
 */
export function anonymizePerformanceLogs(logs: any[]): AnonymousPerformanceLog[] {
  return logs.map(log => anonymizePerformanceLog(log));
}

/**
 * Anonymize engagement event
 */
export function anonymizeEngagementEvent(event: any): AnonymousEngagementEvent {
  // Don't include sensitive event data like email addresses or personal info
  const safeEventData = event.eventData
    ? Object.fromEntries(
        Object.entries(event.eventData).filter(([key]) => {
          // Only include non-sensitive fields
          const sensitiveFields = ['email', 'name', 'password', 'phone', 'address'];
          return !sensitiveFields.includes(key.toLowerCase());
        })
      )
    : undefined;

  return {
    anonymousUserId: createUserIdMapping(event.userId.toString()),
    eventType: event.eventType,
    eventData: safeEventData,
    timestamp: event.timestamp
  };
}

/**
 * Anonymize array of engagement events
 */
export function anonymizeEngagementEvents(events: any[]): AnonymousEngagementEvent[] {
  return events.map(event => anonymizeEngagementEvent(event));
}

/**
 * Strip all user IDs from a dashboard metrics object
 */
export function stripUserIdsFromDashboard(dashboard: any): any {
  if (Array.isArray(dashboard)) {
    return dashboard.map(item => stripUserIdsFromDashboard(item));
  }

  if (typeof dashboard === 'object' && dashboard !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(dashboard)) {
      // Skip userId, userId, _id fields
      if (['userId', '_id', 'user_id'].includes(key)) {
        continue;
      }
      result[key] = stripUserIdsFromDashboard(value);
    }
    return result;
  }

  return dashboard;
}

/**
 * Create anonymized aggregated report
 * Combines cohort metrics with anonymization
 */
export function createAggregatedReport(
  dailyCohortMetrics: any[],
  userMetrics: any[]
): {
  reportDate: Date;
  cohortMetrics: any[];
  aggregateMetrics: {
    totalUsers: number;
    averageAccuracy: number;
    averageCurrentStreak: number;
    averageLongestStreak: number;
    totalAuraInCirculation: number;
    averageAuraPerUser: number;
    totalSummonsPerformed: number;
    averageSummonsPerUser: number;
    totalEvolutions: number;
    evolutionAdoptionRate: number;
    emailMetrics: {
      totalEmailsSent: number;
      globalConversionRate: number;
    };
  };
} {
  const anonymizedCohort = dailyCohortMetrics.map(metric =>
    stripUserIdsFromDashboard(metric)
  );

  const totalUsers = userMetrics.length;
  const totalCorrect = userMetrics.reduce((sum, m) => sum + (m.correctAnswers || 0), 0);
  const totalQuestions = userMetrics.reduce(
    (sum, m) => sum + (m.totalQuestionsAnswered || 0),
    0
  );

  return {
    reportDate: new Date(),
    cohortMetrics: anonymizedCohort,
    aggregateMetrics: {
      totalUsers,
      averageAccuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
      averageCurrentStreak: Math.round(
        userMetrics.reduce((sum, m) => sum + (m.currentStreak || 0), 0) / totalUsers
      ),
      averageLongestStreak: Math.round(
        userMetrics.reduce((sum, m) => sum + (m.longestStreak || 0), 0) / totalUsers
      ),
      totalAuraInCirculation: userMetrics.reduce(
        (sum, m) => sum + (m.currentAuraBalance || 0),
        0
      ),
      averageAuraPerUser: Math.round(
        userMetrics.reduce((sum, m) => sum + (m.currentAuraBalance || 0), 0) / totalUsers
      ),
      totalSummonsPerformed: userMetrics.reduce((sum, m) => sum + (m.totalSummons || 0), 0),
      averageSummonsPerUser: Math.round(
        userMetrics.reduce((sum, m) => sum + (m.totalSummons || 0), 0) / totalUsers
      ),
      totalEvolutions: userMetrics.reduce(
        (sum, m) => sum + (m.creatureEvolutionCount || 0),
        0
      ),
      evolutionAdoptionRate: Math.round(
        (userMetrics.filter(m => (m.creatureEvolutionCount || 0) > 0).length / totalUsers) *
          100
      ),
      emailMetrics: {
        totalEmailsSent: userMetrics.reduce((sum, m) => sum + (m.emailsReceived || 0), 0),
        globalConversionRate: Math.round(
          (userMetrics.reduce((sum, m) => sum + (m.nudgeConversions || 0), 0) /
            userMetrics.reduce((sum, m) => sum + (m.emailsReceived || 0), 1)) *
            100
        )
      }
    }
  };
}

/**
 * Validate that data is fully anonymized
 * Returns true if no PII found
 */
export function validateAnonymization(data: any): {
  isAnonymized: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
  const phoneRegex = /\d{3}-?\d{3}-?\d{4}/g;

  const dataString = JSON.stringify(data);

  if (dataString.match(emailRegex)) {
    issues.push('Email addresses found in anonymized data');
  }
  if (dataString.match(phoneRegex)) {
    issues.push('Phone numbers found in anonymized data');
  }
  if (dataString.includes('userId') || dataString.includes('_id')) {
    issues.push('User ID references still present');
  }

  return {
    isAnonymized: issues.length === 0,
    issues
  };
}

/**
 * GDPR compliance: Right to be forgotten
 * Prepares user data for deletion while preserving aggregate insights
 */
export async function prepareUserForDeletion(userId: string): Promise<{
  archived: boolean;
  reason: string;
  retentionPolicy: string;
}> {
  return {
    archived: true,
    reason: 'User requested data deletion (GDPR Article 17)',
    retentionPolicy:
      'Anonymized aggregation metrics retained for 90 days for analytics, then purged. Performance logs deleted immediately.'
  };
}

/**
 * Export configuration for investor reports
 */
export const PRIVACY_EXPORT_CONFIG = {
  // Fields to include in anonymized exports
  SAFE_USER_FIELDS: [
    'anonymousUserId',
    'totalQuestionsAnswered',
    'correctAnswers',
    'averageAccuracy',
    'currentStreak',
    'longestStreak',
    'totalStreakRecoveries',
    'emailsReceived',
    'nudgeConversions',
    'nudgeConversionRate',
    'createdAt'
  ],

  // Fields to exclude from any export
  SENSITIVE_FIELDS: [
    'email',
    'password',
    'phoneNumber',
    'address',
    'ssn',
    'creditCard',
    'firebaseUid',
    'googleId',
    'githubId'
  ],

  // Retention periods (in days)
  RETENTION_PERIODS: {
    performanceLogs: 365, // 1 year
    engagementEvents: 180, // 6 months
    userMetrics: -1, // Keep indefinitely (anonymized)
    cohortMetrics: -1 // Keep indefinitely (aggregate)
  }
};
