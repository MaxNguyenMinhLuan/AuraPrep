@echo off
REM AuraPrep Complete Deployment Setup
REM This script handles everything needed for Firebase deployment

setlocal enabledelayedexpansion

cd /d "C:\Users\Wootton High School\AuraPrep"

cls
echo.
echo ====================================================
echo         AURAPREP FIREBASE DEPLOYMENT SETUP
echo ====================================================
echo.
echo Your production build is ready! 
echo Total build size: ~1.5 MB (optimized)
echo.
echo ====================================================
echo           DEPLOYMENT OPTIONS
echo ====================================================
echo.
echo 1. Firebase Hosting (Recommended) - https://firebase.google.com
echo 2. Vercel                         - https://vercel.com
echo 3. Netlify                        - https://netlify.com
echo.
echo ====================================================
echo           FIREBASE HOSTING SETUP (Option 1)
echo ====================================================
echo.
echo STEP 1: Create Firebase Project
echo -------
echo 1. Go to: https://console.firebase.google.com
echo 2. Click: Create a project
echo 3. Project name: auraprep-app
echo 4. Accept defaults and create
echo.
echo STEP 2: Get Firebase Credentials
echo -------
echo 1. In Firebase Console, go to Project Settings (gear icon)
echo 2. Click the Web App icon and create an app
echo 3. Copy the config object
echo.
echo STEP 3: Update Configuration
echo -------
echo 1. Open .env.production in this folder
echo 2. Replace placeholder values with your Firebase config:
echo.
echo    VITE_FIREBASE_API_KEY=YOUR_API_KEY
echo    VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
echo    VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
echo    VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
echo    VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
echo    VITE_FIREBASE_APP_ID=YOUR_APP_ID
echo.
echo STEP 4: Enable Firebase Features
echo -------
echo 1. Go to Firebase Console ^> Build ^> Authentication
echo 2. Click Get Started
echo 3. Enable: Email/Password and Google sign-in
echo.
echo STEP 5: Deploy
echo -------
echo.

setlocal
call :deploy
endlocal
goto end

:deploy
echo Now opening deployment script...
echo.
pause

REM Check Firebase CLI
set FIREBASE_CLI=C:\Users\Wootton High School\AppData\Roaming\npm\node_modules\firebase-tools\lib\bin\firebase.js

if not exist "%FIREBASE_CLI%" (
  echo Installing Firebase CLI (this may take a minute)...
  call npm.cmd install -g firebase-tools
)

echo.
echo Starting Firebase authentication...
echo This will open your browser for login.
echo.

node "%FIREBASE_CLI%" login --no-localhost

if !errorlevel! equ 0 (
  echo.
  echo [OK] Firebase authenticated!
  echo.
  echo Now deploying to Firebase Hosting...
  echo.
  node "%FIREBASE_CLI%" deploy --only hosting
  
  if !errorlevel! equ 0 (
    echo.
    echo ================================================
    echo   DEPLOYMENT SUCCESSFUL!
    echo ================================================
    echo.
    echo Your app is now live at:
    echo https://auraprep-app.web.app
    echo.
    echo Features:
    echo - Firebase Authentication (Google ^& Email)
    echo - Real-time creature summoning
    echo - Daily missions and leaderboards
    echo - Creature collection and evolution
    echo.
  ) else (
    echo.
    echo [ERROR] Deployment failed
    echo Please check the error message above
    echo.
  )
) else (
  echo.
  echo [ERROR] Firebase authentication failed
  echo Please try again
  echo.
)

:end
pause
