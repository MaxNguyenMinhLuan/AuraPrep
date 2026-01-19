/**
 * Analytics Export Utilities
 *
 * Functions to export analytics data in various formats:
 * - CSV (for Excel/Google Sheets)
 * - JSON (for programmatic use/Chart.js)
 * - HTML Tables (for email reports)
 */

import { Parser } from 'json2csv';
import { validateAnonymization } from './privacy';

interface ExportOptions {
  anonymize?: boolean;
  format: 'json' | 'csv' | 'html';
  includeMetadata?: boolean;
  compress?: boolean;
}

/**
 * Export dashboard metrics as CSV
 * Suitable for Excel, Google Sheets, Tableau, Power BI
 */
export function exportDashboardMetricsAsCSV(
  dashboardData: any,
  options: { includeMetadata?: boolean } = {}
): string {
  const rows: Record<string, any>[] = [];

  // User Metrics Section
  if (dashboardData.user_metrics) {
    rows.push({
      section: 'User Metrics',
      metric: 'Total Users',
      value: dashboardData.user_metrics.total_users
    });
    rows.push({
      section: 'User Metrics',
      metric: 'Active Users (7d)',
      value: dashboardData.user_metrics.active_users_7d
    });
    rows.push({
      section: 'User Metrics',
      metric: 'DAU (Current)',
      value: dashboardData.user_metrics.dau_current
    });
    rows.push({
      section: 'User Metrics',
      metric: 'DAU 7-day Average',
      value: dashboardData.user_metrics.dau_7d_avg.toFixed(2)
    });
    rows.push({
      section: 'User Metrics',
      metric: 'DAU 30-day Average',
      value: dashboardData.user_metrics.dau_30d_avg.toFixed(2)
    });
    rows.push({
      section: 'User Metrics',
      metric: 'Retention Rate (%)',
      value: dashboardData.user_metrics.retention_rate
    });
  }

  // Learning Metrics Section
  if (dashboardData.learning_metrics) {
    rows.push({
      section: 'Learning Efficacy',
      metric: 'Subtopic Milestones Achieved',
      value: dashboardData.learning_metrics.subtopic_milestones_achieved
    });
    rows.push({
      section: 'Learning Efficacy',
      metric: 'Milestone Penetration (%)',
      value: dashboardData.learning_metrics.milestone_penetration
    });
  }

  // Engagement Metrics Section
  if (dashboardData.engagement_metrics) {
    rows.push({
      section: 'Engagement',
      metric: 'Avg Summons Per User',
      value: dashboardData.engagement_metrics.avg_summmons_per_user
    });
    rows.push({
      section: 'Engagement',
      metric: 'Users with Evolutions',
      value: dashboardData.engagement_metrics.users_with_evolutions
    });
    rows.push({
      section: 'Engagement',
      metric: 'Evolution Penetration (%)',
      value: dashboardData.engagement_metrics.evolution_penetration
    });
    rows.push({
      section: 'Engagement',
      metric: 'Total Evolutions',
      value: dashboardData.engagement_metrics.total_evolutions
    });
  }

  // Nudge Metrics Section
  if (dashboardData.nudge_metrics) {
    rows.push({
      section: 'Email Nudges',
      metric: 'Daily Nudge Emails Sent',
      value: dashboardData.nudge_metrics.daily_nudge_emails
    });
    rows.push({
      section: 'Email Nudges',
      metric: 'Nudge Conversion Rate (%)',
      value: dashboardData.nudge_metrics.nudge_conversion_rate
    });
  }

  // Add metadata if requested
  if (options.includeMetadata) {
    rows.push({
      section: 'Report Metadata',
      metric: 'Generated',
      value: new Date().toISOString()
    });
    rows.push({
      section: 'Report Metadata',
      metric: 'Format',
      value: 'Investor Dashboard Export'
    });
  }

  const parser = new Parser({
    fields: ['section', 'metric', 'value'],
    flatten: false
  });

  return parser.parse(rows);
}

/**
 * Export user analytics as CSV
 * One row per user with all their metrics
 */
export function exportUserAnalyticsAsCSV(
  users: any[],
  options: { anonymize?: boolean } = {}
): string {
  const rows = users.map(user => ({
    userId: options.anonymize ? `anon-${user._id.toString().substring(0, 8)}` : user._id,
    totalQuestions: user.totalQuestionsAnswered || 0,
    accuracy: ((user.correctAnswers || 0) / Math.max(user.totalQuestionsAnswered || 1, 1) * 100).toFixed(2),
    currentStreak: user.currentStreak || 0,
    longestStreak: user.longestStreak || 0,
    totalSummons: user.totalSummons || 0,
    totalEvolutions: user.creatureEvolutionCount || 0,
    emailsSent: user.emailsReceived || 0,
    emailConversionRate: user.nudgeConversionRate || 0,
    auraBalance: user.currentAuraBalance || 0,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : ''
  }));

  const parser = new Parser({
    fields: [
      'userId',
      'totalQuestions',
      'accuracy',
      'currentStreak',
      'longestStreak',
      'totalSummons',
      'totalEvolutions',
      'emailsSent',
      'emailConversionRate',
      'auraBalance',
      'createdAt'
    ]
  });

  return parser.parse(rows);
}

/**
 * Export retention cohort analysis as CSV
 * Shows cohort retention across time periods
 */
export function exportRetentionCohortsAsCSV(
  cohortData: Record<string, { total: number; active: number }>
): string {
  const rows = Object.entries(cohortData).map(([cohortDate, data]) => ({
    cohortDate,
    totalUsers: data.total,
    activeUsers: data.active,
    retentionRate: ((data.active / data.total) * 100).toFixed(2)
  }));

  const parser = new Parser({
    fields: ['cohortDate', 'totalUsers', 'activeUsers', 'retentionRate']
  });

  return parser.parse(rows);
}

/**
 * Export dashboard metrics as JSON
 * Suitable for Chart.js, programmatic consumption, or APIs
 */
export function exportDashboardMetricsAsJSON(
  dashboardData: any,
  options: { includeMetadata?: boolean } = {}
): string {
  const exportData: any = {
    metrics: dashboardData,
    metadata: {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      format: 'investor-dashboard'
    }
  };

  // Validate anonymization if needed
  if (options.includeMetadata) {
    const validation = validateAnonymization(dashboardData);
    exportData.metadata.anonymizationStatus = validation;
  }

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export user analytics as JSON
 */
export function exportUserAnalyticsAsJSON(
  users: any[],
  options: { anonymize?: boolean } = {}
): string {
  const anonymizedUsers = users.map(user => ({
    ...user,
    ...(options.anonymize && { userId: `anon-${user._id.toString().substring(0, 8)}` })
  }));

  return JSON.stringify(
    {
      users: anonymizedUsers,
      metadata: {
        count: users.length,
        exportedAt: new Date().toISOString(),
        anonymized: options.anonymize || false
      }
    },
    null,
    2
  );
}

/**
 * Export as HTML table for email reports
 */
export function exportDashboardMetricsAsHTML(dashboardData: any): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AuraPrep Analytics Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; margin-bottom: 15px; font-size: 18px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #4CAF50;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    tr:hover { background: #f9f9f9; }
    .value { font-weight: bold; color: #4CAF50; }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎓 AuraPrep Analytics Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>

    <h2>📊 User Metrics</h2>
    <table>
      <tr>
        <th>Metric</th>
        <th>Value</th>
      </tr>
      ${dashboardData.user_metrics ? `
        <tr>
          <td>Total Users</td>
          <td class="value">${dashboardData.user_metrics.total_users.toLocaleString()}</td>
        </tr>
        <tr>
          <td>Active Users (7 days)</td>
          <td class="value">${dashboardData.user_metrics.active_users_7d.toLocaleString()}</td>
        </tr>
        <tr>
          <td>Daily Active Users (Current)</td>
          <td class="value">${dashboardData.user_metrics.dau_current.toLocaleString()}</td>
        </tr>
        <tr>
          <td>7-day Average DAU</td>
          <td class="value">${dashboardData.user_metrics.dau_7d_avg.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Retention Rate</td>
          <td class="value">${dashboardData.user_metrics.retention_rate}%</td>
        </tr>
      ` : ''}
    </table>

    <h2>🎯 Learning Efficacy</h2>
    <table>
      <tr>
        <th>Metric</th>
        <th>Value</th>
      </tr>
      ${dashboardData.learning_metrics ? `
        <tr>
          <td>Subtopic Milestones Achieved</td>
          <td class="value">${dashboardData.learning_metrics.subtopic_milestones_achieved}</td>
        </tr>
        <tr>
          <td>Milestone Penetration</td>
          <td class="value">${dashboardData.learning_metrics.milestone_penetration}%</td>
        </tr>
      ` : ''}
    </table>

    <h2>🎮 Engagement & Gacha Economics</h2>
    <table>
      <tr>
        <th>Metric</th>
        <th>Value</th>
      </tr>
      ${dashboardData.engagement_metrics ? `
        <tr>
          <td>Average Summons Per User</td>
          <td class="value">${dashboardData.engagement_metrics.avg_summmons_per_user}</td>
        </tr>
        <tr>
          <td>Users with Evolutions</td>
          <td class="value">${dashboardData.engagement_metrics.users_with_evolutions.toLocaleString()}</td>
        </tr>
        <tr>
          <td>Evolution Penetration</td>
          <td class="value">${dashboardData.engagement_metrics.evolution_penetration}%</td>
        </tr>
        <tr>
          <td>Total Evolutions</td>
          <td class="value">${dashboardData.engagement_metrics.total_evolutions.toLocaleString()}</td>
        </tr>
      ` : ''}
    </table>

    <h2>📧 Email Nudge Performance</h2>
    <table>
      <tr>
        <th>Metric</th>
        <th>Value</th>
      </tr>
      ${dashboardData.nudge_metrics ? `
        <tr>
          <td>Daily Nudge Emails Sent</td>
          <td class="value">${dashboardData.nudge_metrics.daily_nudge_emails.toLocaleString()}</td>
        </tr>
        <tr>
          <td>Nudge Conversion Rate</td>
          <td class="value">${dashboardData.nudge_metrics.nudge_conversion_rate}%</td>
        </tr>
      ` : ''}
    </table>

    <div class="footer">
      <p>This report was automatically generated by AuraPrep Analytics System.</p>
      <p>For more information, visit: https://auraprep.com/analytics</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Export performance logs for learning analysis
 * Shows question-level performance for educational analytics
 */
export function exportPerformanceLogsAsJSON(
  performanceLogs: any[],
  options: { anonymize?: boolean; limit?: number } = {}
): string {
  const logs = performanceLogs.slice(0, options.limit || 1000).map(log => ({
    ...log,
    ...(options.anonymize && { userId: `anon-${log.userId.toString().substring(0, 8)}` })
  }));

  return JSON.stringify(
    {
      logs,
      metadata: {
        count: logs.length,
        exportedAt: new Date().toISOString(),
        anonymized: options.anonymize || false,
        limited: options.limit ? `First ${options.limit} records` : 'All records'
      }
    },
    null,
    2
  );
}

/**
 * Create a comprehensive analytics package
 * Combines all metrics in a single export
 */
export async function createAnalyticsPackage(
  dashboardData: any,
  userMetrics: any[],
  performanceLogs: any[],
  options: { anonymize?: boolean; format?: 'json' | 'csv' | 'html' } = {}
): Promise<Record<string, string>> {
  const format = options.format || 'json';

  if (format === 'json') {
    return {
      dashboard: exportDashboardMetricsAsJSON(dashboardData, { includeMetadata: true }),
      users: exportUserAnalyticsAsJSON(userMetrics, { anonymize: options.anonymize }),
      performance: exportPerformanceLogsAsJSON(performanceLogs, { anonymize: options.anonymize })
    };
  }

  if (format === 'csv') {
    return {
      dashboard: exportDashboardMetricsAsCSV(dashboardData, { includeMetadata: true }),
      users: exportUserAnalyticsAsCSV(userMetrics, { anonymize: options.anonymize })
    };
  }

  if (format === 'html') {
    return {
      dashboard: exportDashboardMetricsAsHTML(dashboardData),
      users: `<p>HTML export available in JSON format for user data</p>`
    };
  }

  throw new Error(`Unsupported export format: ${format}`);
}
