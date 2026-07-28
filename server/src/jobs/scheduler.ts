/**
 * Analytics Cron Job Scheduler
 *
 * Runs daily aggregation jobs to calculate investor metrics
 * Executes at midnight UTC to prepare data for next day's dashboard
 */

import cron from 'node-cron';
import { AggregationService } from '../services/aggregation.service';
import { AnalyticsService } from '../services/analytics.service';
import { NudgeService } from '../services/nudge.service';
import { QuestionIngestionService } from '../services/questionIngestion.service';

export class AnalyticsScheduler {
  /**
   * Initialize all cron jobs
   * Should be called once during server startup
   */
  static initializeJobs(): void {
    console.log('Initializing analytics cron jobs...');

    // Daily metrics aggregation - runs at midnight UTC
    this.scheduleDailyAggregation();

    // Hourly nudge efficacy recalculation - runs every hour
    this.scheduleHourlyNudgeMetrics();

    // Hourly email and Web Push reminder job - runs every hour
    this.scheduleHourlyNudgeJob();

    // Weekly retention cohort analysis - runs Sunday at 2 AM UTC
    this.scheduleWeeklyRetentionAnalysis();

    // Monthly investor report generation - runs 1st of month at 3 AM UTC
    this.scheduleMonthlyInvestorReport();

    // Official College Board questions ingestion - runs daily at 4:00 AM and 6:30 PM (Server Local Time)
    this.scheduleOfficialQuestionIngestion();

    console.log('✅ All analytics cron jobs initialized');
  }

  /**
   * Schedule daily aggregation at midnight UTC
   * Calculates DAU, accuracy, streaks, and other daily metrics
   */
  private static scheduleDailyAggregation(): void {
    // Runs at 00:00 UTC every day
    cron.schedule('0 0 * * *', async () => {
      const startTime = Date.now();
      console.log(`[${new Date().toISOString()}] Starting daily aggregation...`);

      try {
        // Step 1: Calculate daily cohort metrics (DAU, MAU, accuracy, etc.)
        await AggregationService.calculateDailyCohortMetrics();
        console.log('✓ Daily cohort metrics calculated');

        // Step 2: Update all user metrics in batch
        await AggregationService.batchUpdateAllUserMetrics();
        console.log('✓ Batch user metrics updated');

        // Step 3: Calculate retention cohorts for analysis
        await AggregationService.calculateRetentionCohorts();
        console.log('✓ Retention cohorts calculated');

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(
          `✅ Daily aggregation completed successfully in ${duration}s`
        );
      } catch (error) {
        console.error('❌ Daily aggregation failed:', error);
        // Send alert to monitoring service (e.g., Sentry, DataDog)
        this.sendAlert({
          severity: 'high',
          message: 'Daily aggregation job failed',
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
      }
    });

    console.log('✓ Scheduled daily aggregation at 00:00 UTC');
  }

  /**
   * Schedule hourly nudge efficacy recalculation
   * Updates which nudges (morning/afternoon/evening) are most effective
   */
  private static scheduleHourlyNudgeMetrics(): void {
    // Runs every hour at minute 0
    cron.schedule('0 * * * *', async () => {
      const startTime = Date.now();

      try {
        // Query last hour of nudge conversions
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        // This would query engagement events and update metrics
        // For now, just log that it ran
        console.log(
          `[${new Date().toISOString()}] Hourly nudge metrics update completed`
        );
      } catch (error) {
        console.error('❌ Hourly nudge metrics update failed:', error);
      }
    });

    console.log('✓ Scheduled hourly nudge efficacy calculation');
  }

  /**
   * Schedule hourly reminder job
   * Checks local timezones and sends morning/afternoon/evening email and Web Push nudges
   */
  private static scheduleHourlyNudgeJob(): void {
    cron.schedule('0 * * * *', async () => {
      console.log(`[${new Date().toISOString()}] Starting scheduled hourly reminder job...`);
      try {
        await NudgeService.processHourlyNudges();
      } catch (error) {
        console.error('❌ Scheduled hourly email nudge job failed:', error);
      }
    });

    console.log('✓ Scheduled hourly email nudge job');
  }

  /**
   * Schedule weekly retention cohort analysis
   * Runs every Sunday at 2 AM UTC
   */
  private static scheduleWeeklyRetentionAnalysis(): void {
    // Runs at 02:00 UTC on Sunday (day 0)
    cron.schedule('0 2 * * 0', async () => {
      const startTime = Date.now();
      console.log(
        `[${new Date().toISOString()}] Starting weekly retention analysis...`
      );

      try {
        await AggregationService.calculateRetentionCohorts();

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(
          `✅ Weekly retention analysis completed in ${duration}s`
        );
      } catch (error) {
        console.error('❌ Weekly retention analysis failed:', error);
        this.sendAlert({
          severity: 'medium',
          message: 'Weekly retention analysis failed',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });

    console.log('✓ Scheduled weekly retention analysis at 02:00 UTC Sunday');
  }

  /**
   * Schedule monthly investor report generation
   * Runs on the 1st of each month at 3 AM UTC
   */
  private static scheduleMonthlyInvestorReport(): void {
    // Runs at 03:00 UTC on the 1st of every month
    cron.schedule('0 3 1 * *', async () => {
      const startTime = Date.now();
      console.log(
        `[${new Date().toISOString()}] Starting monthly investor report generation...`
      );

      try {
        const investorMetrics = await AggregationService.generateInvestorMetrics();

        // Log key metrics
        console.log('📊 Monthly Investor Metrics:', {
          totalUsers: investorMetrics.user_metrics.total_users,
          dau: investorMetrics.user_metrics.dau_current,
          retentionRate: investorMetrics.user_metrics.retention_rate,
          evolutionPenetration:
            investorMetrics.engagement_metrics.evolution_penetration
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(
          `✅ Monthly investor report generated in ${duration}s`
        );

        // TODO: Save report to storage or email to stakeholders
      } catch (error) {
        console.error('❌ Monthly investor report generation failed:', error);
        this.sendAlert({
          severity: 'critical',
          message: 'Monthly investor report generation failed',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });

    console.log('✓ Scheduled monthly investor report at 03:00 UTC on 1st');
  }

  /**
   * Stop all cron jobs
   * Use when gracefully shutting down the server
   */
  static stopAllJobs(): void {
    cron.getTasks().forEach(task => task.stop());
    console.log('✓ All cron jobs stopped');
  }

  /**
   * Get status of all scheduled jobs
   */
  static getJobStatus(): {
    totalJobs: number;
    nextRuns: Record<string, string>;
  } {
    const tasks = cron.getTasks();
    return {
      totalJobs: tasks instanceof Map ? tasks.size : (tasks as any).length || 0,
      nextRuns: {
        dailyAggregation: 'Every day at 00:00 UTC',
        hourlyNudgeMetrics: 'Every hour at :00',
        weeklyRetention: 'Every Sunday at 02:00 UTC',
        monthlyInvestorReport: 'Every 1st at 03:00 UTC'
      }
    };
  }

  /**
   * Send alert to monitoring service
   */
  private static sendAlert(alert: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    error?: string;
    timestamp?: string;
  }): void {
    // In production, integrate with:
    // - Sentry (error tracking)
    // - DataDog (monitoring)
    // - PagerDuty (critical alerts)
    // - Slack (team notifications)

    console.error(`[ALERT-${alert.severity.toUpperCase()}] ${alert.message}`, {
      error: alert.error,
      timestamp: alert.timestamp || new Date().toISOString()
    });

    // TODO: Implement actual alert sending
    // Example:
    // if (alert.severity === 'critical') {
    //   await notifyPagerDuty(alert);
    // }
  }

  /**
   * Schedule official question ingestion at 4:00 AM and 6:30 PM daily
   */
  private static scheduleOfficialQuestionIngestion(): void {
    // 4 AM daily
    cron.schedule('0 4 * * *', async () => {
      console.log(`[${new Date().toISOString()}] Cron trigger: 4 AM ingestion starting...`);
      await QuestionIngestionService.ingestOfficialQuestions();
    });

    // 6:30 PM daily
    cron.schedule('30 18 * * *', async () => {
      console.log(`[${new Date().toISOString()}] Cron trigger: 6:30 PM ingestion starting...`);
      await QuestionIngestionService.ingestOfficialQuestions();
    });

    console.log('✓ Scheduled official question ingestion daily at 04:00 and 18:30');
  }
}

/**
 * Manual job execution for testing
 * Usage: node -e "require('./scheduler').runDailyAggregationNow()"
 */
export async function runDailyAggregationNow(): Promise<void> {
  console.log('Running daily aggregation manually...');
  try {
    await AggregationService.calculateDailyCohortMetrics();
    await AggregationService.batchUpdateAllUserMetrics();
    await AggregationService.calculateRetentionCohorts();
    console.log('✅ Manual daily aggregation completed');
  } catch (error) {
    console.error('❌ Manual aggregation failed:', error);
    throw error;
  }
}

/**
 * Generate investor report manually for testing
 */
export async function generateInvestorReportNow(): Promise<void> {
  console.log('Generating investor report manually...');
  try {
    const report = await AggregationService.generateInvestorMetrics();
    console.log('📊 Investor Report:', JSON.stringify(report, null, 2));
  } catch (error) {
    console.error('❌ Report generation failed:', error);
    throw error;
  }
}

/**
 * Manual hourly nudge check for testing
 */
export async function runHourlyNudgesNow(): Promise<void> {
  console.log('Running hourly email nudges manually...');
  try {
    await NudgeService.processHourlyNudges();
    console.log('✅ Manual hourly nudges check completed');
  } catch (error) {
    console.error('❌ Manual hourly nudges failed:', error);
    throw error;
  }
}
