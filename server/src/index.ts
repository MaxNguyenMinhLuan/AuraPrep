import mongoose from 'mongoose';
import app from './app';
import { config, validateConfig } from './config';

async function startServer(): Promise<void> {
    try {
        // Validate configuration
        validateConfig();

        // Connect to MongoDB with connection pooling
        console.log('Connecting to MongoDB...');
        console.log(`MongoDB URI: ${config.mongodb.uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Hide credentials in logs

        await mongoose.connect(config.mongodb.uri, config.mongodb.options);
        console.log(`Connected to MongoDB (pool size: ${config.mongodb.options.maxPoolSize})`);

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
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

startServer();
