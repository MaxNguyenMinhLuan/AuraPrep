@echo off
REM AuraPrep Firebase Deployment Script
REM This script handles the complete deployment process

setlocal enabledelayedexpansion

cd /d "C:\Users\Wootton High School\AuraPrep"

echo.
echo ==========================================
echo   AuraPrep Firebase Deployment Script
echo ==========================================
echo.

REM Check if dist folder exists
if not exist "dist\" (
  echo ERROR: dist\ folder not found!
  echo Please run: npm run build
  pause
  exit /b 1
)

echo [OK] Production build found
echo.

REM Find Firebase CLI
set FIREBASE_CLI=C:\Users\Wootton High School\AppData\Roaming\npm\node_modules\firebase-tools\lib\bin\firebase.js

if not exist "%FIREBASE_CLI%" (
  echo Installing Firebase CLI...
  call npm install -g firebase-tools
)

echo [OK] Firebase CLI ready
echo.

REM Check Firebase authentication
echo Checking Firebase authentication status...
node "%FIREBASE_CLI%" projects:list >nul 2>&1

if !errorlevel! neq 0 (
  echo [AUTH REQUIRED] You need to authenticate with Firebase
  echo.
  echo Running: firebase login
  echo Please complete the authentication in your browser
  echo.
  node "%FIREBASE_CLI%" login --no-localhost
  
  if !errorlevel! neq 0 (
    echo Authentication failed. Please try again.
    pause
    exit /b 1
  )
)

echo [OK] Firebase authenticated
echo.

REM Check firebase.json and .firebaserc
if not exist "firebase.json" (
  echo ERROR: firebase.json not found!
  pause
  exit /b 1
)

if not exist ".firebaserc" (
  echo ERROR: .firebaserc not found!
  pause
  exit /b 1
)

echo [OK] Firebase configuration ready
echo.

REM Deploy
echo Starting deployment...
echo.

node "%FIREBASE_CLI%" deploy --only hosting

if !errorlevel! equ 0 (
  echo.
  echo ==========================================
  echo   DEPLOYMENT SUCCESSFUL!
  echo ==========================================
  echo.
  echo Your app is now live at:
  echo https://auraprep-app.web.app
  echo.
) else (
  echo.
  echo DEPLOYMENT FAILED
  echo Please check the error messages above
  echo.
)

pause
