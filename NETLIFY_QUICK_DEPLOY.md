# 🚀 Quick Netlify Deployment Reference

## One-Click Deployment Steps

### 1. Go to Netlify
Visit: https://app.netlify.com

### 2. Connect GitHub
- Click "New site from Git"
- Choose "GitHub"
- Select repository: `EarlyAlertNetwork`

### 3. Build Settings
```
Build command: npx tsx scripts/build-for-netlify.js
Publish directory: dist
Node version: 18
```

### 4. Environment Variables
Add these in Site Settings > Environment Variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_BGySuq28eslL@ep-odd-cell-a5099apb-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SESSION_SECRET=ewers-super-secret-key-2024
NODE_ENV=production
```

### 5. Deploy
Click "Deploy site" and wait for completion.

## ✅ Ready to Deploy!

Your application is now ready for Netlify deployment. The build output is in the `dist/` folder with all necessary configuration files.

**Current Status:**
- ✅ Frontend built successfully
- ✅ Netlify configuration files created
- ✅ GitHub repository ready
- ✅ Environment variables documented

**Next:** Follow the steps above to deploy to Netlify!
