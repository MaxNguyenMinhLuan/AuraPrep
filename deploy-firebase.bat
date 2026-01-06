@echo off
REM Firebase Deployment Script for AuraPrep
cd /d "C:\Users\Wootton High School\AuraPrep"

echo Installing firebase-tools globally...
call npm install -g firebase-tools

echo.
echo ========================================
echo Firebase Hosting Deployment
echo ========================================
echo.
echo Your production build is ready in dist/
echo.
echo To deploy to Firebase Hosting:
echo 1. Run: firebase login
echo 2. Run: firebase deploy --only hosting
echo.
echo After deployment, your app will be live at:
echo https://[your-project-id].web.app
echo.
pause
