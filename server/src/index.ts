import mongoose from 'mongoose';
import app from './app';
import { config, validateConfig } from './config';
import { AnalyticsScheduler } from './jobs/scheduler';
import { QuestionIngestionService } from './services/questionIngestion.service';

// Safety net for third-party library quirks that throw outside the promise
// chain a normal try/catch wraps (e.g. google-auth-library's internal
// credential-lookup race, which crashed this process repeatedly on 2026-07-30
// even though the calling code in leaderboard.service.ts had its own
// try/catch). Logs loudly instead of silently dying mid-request/mid-sweep -
// intentional process.exit() calls elsewhere are unaffected, since exit()
// doesn't route through these events.
process.on('unhandledRejection', (reason) => {
    console.error('⚠️  Unhandled promise rejection (process kept alive):', reason);
});

process.on('uncaughtException', (error) => {
    console.error('⚠️  Uncaught exception (process kept alive):', error);
});

async function startServer(): Promise<void> {
    try {
        // Validate configuration
        validateConfig();

        const mongoUri = config.mongodb.uri;

        // Connect to MongoDB with connection pooling
        console.log('Connecting to MongoDB...');
        console.log(`MongoDB URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Hide credentials in logs

        // No fallback to an in-memory database: a connection failure here
        // must be loud (crash + restart) rather than silently booting on an
        // empty ephemeral DB, which previously caused the nudge cron to run
        // "successfully" against zero users with no visible error.
        await mongoose.connect(mongoUri, config.mongodb.options);
        console.log(`Connected to MongoDB (pool size: ${config.mongodb.options.maxPoolSize})`);

        // Seed backup questions & fetch official questions
        QuestionIngestionService.seedBackupQuestions();
        QuestionIngestionService.ingestOfficialQuestions();

        // Initialize analytics cron jobs
        AnalyticsScheduler.initializeJobs();

        // Start server
        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
            console.log(`Environment: ${config.nodeEnv}`);
            console.log(`CORS origin: ${config.cors.origin}`);
        });
    } catch (error) {
        console.error('\n========================================');
        console.error('FAILED TO START SERVER');
        console.error('========================================');

        if (error instanceof Error) {
            if (error.message.includes('ECONNREFUSED') || error.message.includes('connect ECONNREFUSED')) {
                console.error('\nMongoDB Connection Failed!');
                console.error('Could not connect to MongoDB at:', config.mongodb.uri);
                console.error('\nPossible solutions:');
                console.error('1. Install and start MongoDB locally');
                console.error('   - Download from: https://www.mongodb.com/try/download/community');
                console.error('2. OR use MongoDB Atlas (free cloud database):');
                console.error('   - Sign up at: https://www.mongodb.com/cloud/atlas');
                console.error('   - Create a free M0 cluster');
                console.error('   - Update MONGODB_URI in server/.env with your Atlas connection string');
                console.error('   - Example: mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/auraprep');
            } else {
                console.error('\nError:', error.message);
            }
        } else {
            console.error('Error:', error);
        }

        console.error('========================================\n');
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    AnalyticsScheduler.stopAllJobs();
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    AnalyticsScheduler.stopAllJobs();
    await mongoose.connection.close();
    process.exit(0);
});

startServer();
