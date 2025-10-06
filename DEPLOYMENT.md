# Early Alert Network - Deployment Guide

## 🚀 Deployment Options

### 1. Neon Database Setup

The application uses Neon as the primary cloud database. The connection string is already configured in the environment files.

**Neon Database URL:**
```
postgresql://neondb_owner:npg_BGySuq28eslL@ep-odd-cell-a5099apb-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**To set up the Neon database:**
```bash
# Set the Neon database URL
export NEON_DATABASE_URL="postgresql://neondb_owner:npg_BGySuq28eslL@ep-odd-cell-a5099apb-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Run the setup script
npx tsx scripts/setup-neon-db.js
```

### 2. Vercel Deployment

**Prerequisites:**
- Vercel account
- Vercel CLI installed

**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

**Environment Variables to set in Vercel:**
- `DATABASE_URL` - Neon database URL
- `SESSION_SECRET` - Random secret key
- `NODE_ENV` - production

### 3. Railway Deployment

**Prerequisites:**
- Railway account
- Railway CLI installed

**Steps:**
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Deploy: `railway up`

**Environment Variables to set in Railway:**
- `DATABASE_URL` - Neon database URL
- `SESSION_SECRET` - Random secret key
- `NODE_ENV` - production

### 4. Docker Deployment

**Local Development:**
```bash
# Build and run with docker-compose
docker-compose up --build
```

**Production:**
```bash
# Build the image
docker build -t early-alert-network .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="your_neon_database_url" \
  -e SESSION_SECRET="your_secret_key" \
  early-alert-network
```

### 5. GitHub Actions Deployment

The repository includes GitHub Actions workflows for automated deployment:

- **Trigger:** Push to `main` branch
- **Tests:** Runs tests and builds application
- **Deploy:** Deploys to Vercel and Railway
- **Database:** Runs migrations on Neon

**Required Secrets in GitHub:**
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `RAILWAY_TOKEN` - Railway deployment token
- `NEON_DATABASE_URL` - Neon database connection string

## 🔧 Environment Configuration

### Development
```bash
# Copy environment template
cp env.production.example .env.development

# Set your local database URL
export DATABASE_URL="postgresql://postgres:Samolan123@localhost:5456/ewers4"
```

### Production
```bash
# Copy environment template
cp env.production.example .env.production

# Set production values
export DATABASE_URL="your_neon_database_url"
export SESSION_SECRET="your_production_secret"
export NODE_ENV="production"
```

## 📊 Database Schema

The application creates the following tables:
- `users` - User accounts and authentication
- `incidents` - Emergency incidents
- `alerts` - System alerts and notifications
- `data_sources` - External data sources
- `response_plans` - Emergency response procedures
- `risk_indicators` - Risk assessment metrics
- `response_activities` - Response team activities
- `response_teams` - Emergency response teams
- `risk_analyses` - Risk analysis reports
- `api_keys` - API key management
- `webhooks` - Webhook configurations
- `surveys` - User surveys
- `survey_responses` - Survey responses
- `incident_reactions` - User reactions to incidents
- `access_logs` - System access logs

## 🔐 Security Configuration

### Required Environment Variables:
- `SESSION_SECRET` - Session encryption key
- `JWT_SECRET` - JWT token signing key
- `ENCRYPTION_KEY` - Data encryption key (32 characters)

### API Keys (Optional):
- `DEEPSEEK_API_KEY` - DeepSeek AI integration
- `OPENAI_API_KEY` - OpenAI integration
- `ANTHROPIC_API_KEY` - Anthropic Claude integration
- `TWILIO_ACCOUNT_SID` - Twilio SMS integration
- `TWILIO_AUTH_TOKEN` - Twilio authentication
- `TWITTER_API_KEY` - Twitter integration
- `FACEBOOK_APP_ID` - Facebook integration
- `EROS_USERNAME` - EROS satellite data
- `EROS_PASSWORD` - EROS authentication

## 🌐 Domain Configuration

### CORS Settings:
```javascript
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

### SSL/TLS:
- Configure SSL certificates in your deployment platform
- Use HTTPS in production
- Set up proper security headers

## 📈 Monitoring and Logging

### Health Check Endpoint:
```
GET /api/health
```

### Logging:
- Application logs are written to console
- Access logs are stored in `access_logs` table
- Error tracking can be configured with Sentry

## 🚨 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check `DATABASE_URL` environment variable
   - Verify Neon database is accessible
   - Check SSL configuration

2. **Port Already in Use**
   - Kill existing processes: `taskkill /F /IM node.exe`
   - Use different port: `PORT=3001 npm run dev`

3. **Missing Tables Error**
   - Run database setup: `npx tsx scripts/setup-neon-db.js`
   - Check database permissions

4. **Authentication Issues**
   - Verify admin user exists
   - Check password hash format
   - Clear browser cookies

### Support:
- Check application logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure database schema is up to date

## 📝 Default Login Credentials

```
Username: admin
Password: admin123
```

**⚠️ Important:** Change these credentials in production!
