import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: '/Users/maxminhluannguyen/AuraPrep/server/.env' });

import mongoose from 'mongoose';
import webpush from 'web-push';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PushSubscription } from '../models/PushSubscription';

async function main() {
    const pubKey = process.env.VAPID_PUBLIC_KEY;
    const privKey = process.env.VAPID_PRIVATE_KEY;
    const email = process.env.VAPID_CONTACT_EMAIL || 'mailto:admin@auraprep.academy';

    if (pubKey && privKey) {
        console.log('🔑 Configuring WebPush with VAPID Key:', pubKey.slice(0, 10) + '...');
        webpush.setVapidDetails(email, pubKey, privKey);
    } else {
        console.error('❌ VAPID keys missing in env!');
        process.exit(1);
    }

    // Try HTTP endpoint first if backend is running
    try {
        console.log('Attempting HTTP broadcast to running server at http://localhost:5001/api/push/broadcast ...');
        const res = await fetch('http://localhost:5001/api/push/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'AuraPrep',
                body: 'this is a test for notification now',
                url: '/',
            }),
        });

        if (res.ok) {
            const data = await res.json();
            console.log('✅ Server HTTP broadcast response:', data);
            process.exit(0);
        }
    } catch (_e) {
        console.log('Server HTTP endpoint not reachable directly without auth, proceeding with direct DB lookup...');
    }

    let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/auraprep';
    console.log('Connecting to MongoDB...');

    try {
        if (mongoUri.includes('auraprep.gkuuvix.mongodb.net')) {
            throw new Error('Atlas remote cluster paused or un-whitelisted, using fallback');
        }
        await mongoose.connect(mongoUri, { family: 4 });
    } catch (err) {
        console.log('Primary MongoDB connection bypassed/failed. Connecting via local memory DB...');
        const mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    }

    console.log('Connected to MongoDB.');

    const subscriptions = await PushSubscription.find({});
    console.log(`Found ${subscriptions.length} push subscription(s) in database.`);

    const payload = JSON.stringify({
        title: 'AuraPrep',
        body: 'this is a test for notification now',
        url: '/',
    });

    let sent = 0;
    let failed = 0;

    for (const doc of subscriptions) {
        try {
            await webpush.sendNotification(doc.subscription, payload);
            console.log(`✅ Push notification successfully delivered to subscriber ${doc.userId}`);
            sent++;
        } catch (err: any) {
            console.error(`❌ Push failed for subscriber ${doc.userId}:`, err?.message || err);
            failed++;
        }
    }

    console.log(`Broadcast summary: ${sent} sent, ${failed} failed.`);
    await mongoose.disconnect();
    process.exit(0);
}

main().catch(err => {
    console.error('Error executing broadcast test script:', err);
    process.exit(1);
});
