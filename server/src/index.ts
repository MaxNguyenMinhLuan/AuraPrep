import mongoose from 'mongoose';
import app from './app';
import { config, validateConfig } from './config';

async function startServer(): Promise<void> {
    try {
        // Validate configuration
        validateConfig();

        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(config.mongodb.uri);
        console.log('Connected to MongoDB');

        // Start server
        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
            console.log(`Environment: ${config.nodeEnv}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
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
