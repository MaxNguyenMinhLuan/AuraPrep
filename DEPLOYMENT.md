# AuraPrep Deployment Guide

Your AuraPrep application is ready to deploy! The production build is complete in the `dist/` folder.

## 🚀 Quick Deploy Options

### Option 1: Firebase Hosting (Recommended) ⭐

**Best for**: Apps using Firebase Authentication

#### Setup (One-time):
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project named `auraprep-app`
3. In Project Settings → Web App, copy your Firebase credentials
4. Update `.env.production` with your Firebase credentials:
   ```
   VITE_FIREBASE_API_KEY=YOUR_KEY
   VITE_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN
   VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
   ```

#### Deploy:
**Windows:**
```bash
deploy-to-firebase.bat
```

**Mac/Linux:**
```bash
firebase login
firebase deploy --only hosting
```

**Your Live URL:**
```
https://auraprep-app.web.app
```

---

### Option 2: Vercel (Fast & Easy)

**Best for**: Fastest deployment, GitHub integration

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Add New" → "Project" → Import your repo
4. Add environment variables (VITE_FIREBASE_*)
5. Click "Deploy"

**Your Live URL:**
```
https://auraprep.vercel.app
```

---

### Option 3: Netlify (Free Tier)

**Best for**: Easy git-based deployments

1. Connect your GitHub repo at [Netlify](https://netlify.com)
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables (VITE_FIREBASE_*)
5. Deploy!

**Your Live URL:**
```
https://auraprep.netlify.app
```

---

## 📋 Configuration Files

All deployment configuration is pre-configured:

- **`firebase.json`** - Firebase Hosting settings
- **`.firebaserc`** - Firebase project ID
- **`vercel.json`** - Vercel deployment config
- **`.env.production`** - Environment variables for production
- **`deploy-to-firebase.bat`** - Windows deployment script

---

## 🔐 Environment Variables

Update `.env.production` with your Firebase credentials from [Firebase Console](https://console.firebase.google.com):

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

---

## ✅ Deployment Checklist

- [ ] Build the app: `npm run build`
- [ ] Create Firebase project at https://console.firebase.google.com
- [ ] Get Firebase credentials from Project Settings
- [ ] Update `.env.production` with credentials
- [ ] Update `.firebaserc` with your project ID
- [ ] Enable Authentication (Email/Password, Google)
- [ ] Deploy using one of the methods above
- [ ] Test your live app
- [ ] Share the deployed URL!

---

## 🛠️ Troubleshooting

### "Firebase not authenticated"
Run `firebase login` and complete the browser authentication

### "Project ID not found"
Update `.firebaserc` with your actual Firebase project ID

### "Build size too large"
The Firebase SDK adds size. This is normal for production builds.

### Environment variables not loading
Make sure you're using the `VITE_` prefix for all env variables

---

## 📱 Post-Deployment

After deployment:

1. **Test authentication**: Sign up with Google or email/password
2. **Test missions**: Complete a daily mission
3. **Test summoning**: Use aura points to summon creatures
4. **Monitor errors**: Check Firebase Console → Logs

---

## 🎯 Next Steps

### Backend Deployment

Your backend server also needs to be deployed. Current options:

**Railway** (Recommended)
- Easy Node.js deployment
- $5/month starter plan
- https://railway.app

**Render**
- Free tier available
- Easy GitHub integration
- https://render.com

**Heroku Alternative**
- Requires paid plan now
- https://www.heroku.com

### Firebase Realtime Database Setup

1. Go to Firebase Console → Realtime Database
2. Create database in test mode
3. Update CORS_ORIGIN in backend `.env` to your deployed URL

---

## 📞 Support

For issues:
1. Check Firebase Console logs
2. Check browser console (F12)
3. Review deployment script output
4. Verify Firebase project settings

---

**Your app is production-ready! Deploy now with one of the options above.** 🎉
