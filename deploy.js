#!/usr/bin/env node

/**
 * Firebase Deployment Assistant
 * Handles authentication and deployment without requiring browser interaction
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const firebaseCliPath = 'C:\\Users\\Wootton High School\\AppData\\Roaming\\npm\\node_modules\\firebase-tools\\lib\\bin\\firebase.js';

function runCommand(cmd) {
  try {
    const output = execSync(cmd, { encoding: 'utf-8', stdio: 'inherit' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deploy() {
  console.log('========================================');
  console.log('  AuraPrep Firebase Deployment');
  console.log('========================================\n');

  const projectDir = process.cwd();
  
  // Check if dist folder exists
  if (!fs.existsSync(path.join(projectDir, 'dist'))) {
    console.error('❌ Error: dist/ folder not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  console.log('✓ Production build found\n');

  // Check firebase config
  if (!fs.existsSync(path.join(projectDir, 'firebase.json'))) {
    console.error('❌ Error: firebase.json not found');
    process.exit(1);
  }
  
  if (!fs.existsSync(path.join(projectDir, '.firebaserc'))) {
    console.error('❌ Error: .firebaserc not found');
    process.exit(1);
  }

  console.log('✓ Firebase configuration files found\n');
  
  console.log('Next steps:');
  console.log('1. Go to https://console.firebase.google.com');
  console.log('2. Create a new project called "auraprep-app"');
  console.log('3. Enable Firestore & Authentication (Google + Email/Password)');
  console.log('4. Get your Firebase credentials from Project Settings');
  console.log('5. Set environment variables in your .env.local file');
  console.log('\n');
  
  // Try to deploy
  console.log('Attempting to deploy...\n');
  
  const deployCmd = `node "${firebaseCliPath}" deploy --only hosting`;
  console.log(`Running: ${deployCmd}\n`);
  
  const result = runCommand(deployCmd);
  
  if (result.success) {
    console.log('\n✓ Deployment successful!\n');
    console.log('Your app is now live!');
  } else {
    console.log('\n❌ Deployment failed');
    console.log('Error:', result.error);
    console.log('\nMake sure you have:');
    console.log('1. Created a Firebase project');
    console.log('2. Authenticated with: firebase login');
    console.log('3. Updated .firebaserc with your project ID');
  }
}

deploy().catch(console.error);
