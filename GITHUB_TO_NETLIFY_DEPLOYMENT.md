# Deploy Early Alert Network from GitHub to Netlify

## Step-by-Step Deployment Guide

### 1. Prerequisites
- ✅ GitHub repository with your code (already done)
- ✅ Netlify account (create at https://netlify.com)
- ✅ Neon database setup (already done)

### 2. Connect GitHub Repository to Netlify

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Sign in or create an account

2. **Import from Git**
   - Click "New site from Git"
   - Choose "GitHub" as your Git provider
   - Authorize Netlify to access your GitHub account
   - Select your repository: `EarlyAlertNetwork`

### 3. Configure Build Settings

In the Netlify build configuration:

**Build Command:**
```bash
npx tsx scripts/build-for-netlify.js
```

**Publish Directory:**
```
dist
```

**Node Version:**
```
18
```

### 4. Environment Variables

In Netlify dashboard, go to Site settings > Environment variables and add:

```
DATABASE_URL=postgresql://neondb_owner:npg_BGySuq28eslL@ep-odd-cell-a5099apb-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SESSION_SECRET=your-super-secret-session-key-here
NODE_ENV=production
```

**Optional API Keys (add as needed):**
```
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWITTER_API_KEY=your_twitter_key
DEEPSEEK_API_KEY=your_deepseek_key
```

### 5. Deploy

1. Click "Deploy site"
2. Netlify will automatically:
   - Clone your repository
   - Install dependencies
   - Run the build command
   - Deploy the site

### 6. Custom Domain (Optional)

1. Go to Site settings > Domain management
2. Add your custom domain
3. Configure DNS settings as instructed

### 7. Functions Configuration

The `netlify/functions/` folder contains serverless functions for API endpoints:
- `api.js` - Main API handler
- `serverless.js` - Simple serverless function

### 8. Build Output Structure

```
dist/
├── public/           # React app build
├── _redirects        # SPA routing rules
├── _headers          # Security headers
└── netlify.toml      # Netlify configuration
```

### 9. Troubleshooting

**If build fails:**
- Check the build logs in Netlify dashboard
- Ensure all environment variables are set
- Verify Node.js version is 18

**If API endpoints don't work:**
- Check that functions are properly deployed
- Verify environment variables are accessible to functions
- Check function logs in Netlify dashboard

### 10. Continuous Deployment

Once connected, Netlify will automatically deploy when you push to the main branch.

**To trigger manual deployment:**
- Go to Deploys tab in Netlify dashboard
- Click "Trigger deploy"

## Current Status

✅ GitHub repository ready
✅ Build script created (`scripts/build-for-netlify.js`)
✅ Netlify configuration files created
✅ Environment variables documented
✅ Ready for deployment

## Next Steps

1. Follow the steps above to connect GitHub to Netlify
2. Configure build settings and environment variables
3. Deploy and test the application
4. Set up custom domain if needed
