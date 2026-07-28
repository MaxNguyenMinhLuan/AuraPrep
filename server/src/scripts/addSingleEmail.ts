import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const projectId = process.env.FIREBASE_PROJECT_ID || 'auraprep-da99c';

if (getApps().length === 0) {
    initializeApp({ projectId });
}

const db = getFirestore();

async function main() {
    const email = 'savannah.augustoevery@gmail.com';
    const lowercaseEmail = email.toLowerCase();
    
    console.log(`Adding ${lowercaseEmail} to allowlist in Firestore...`);
    
    await db.collection('allowlist').doc(lowercaseEmail).set({
        allowed: true,
        addedAt: new Date().toISOString()
    });
    
    console.log(`✓ Successfully added ${lowercaseEmail} to allowlist!`);
    process.exit(0);
}

main().catch(err => {
    console.error('Failed to add email to allowlist:', err);
    process.exit(1);
});
