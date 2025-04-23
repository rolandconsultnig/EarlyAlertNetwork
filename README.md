# IPCR Early Warning & Response System

An advanced Early Warning & Early Response System leveraging AI and Natural Language Processing (NLP) for comprehensive threat detection and risk assessment across multiple channels in Nigeria.

## Features

- Real-time incident monitoring and reporting
- AI-powered conflict analysis and predictive risk assessment
- Multi-channel text classification with intelligent summarization
- Real-time geospatial incident mapping
- Voice-controlled incident reporting
- One-click language translation for incident reports with prioritized Nigerian languages
- Social media platform integrations (Twilio, Twitter/X, Facebook, Instagram)
- Satellite imagery for geospatial analysis using USGS Earth Explorer API

## Technical Architecture

- React.js frontend with TypeScript and Leaflet for geospatial mapping
- PostgreSQL database with Drizzle ORM
- Express.js backend with RESTful API endpoints
- Advanced Pattern Detection module with AI-powered conflict analysis
- OpenAI integration for AI chat analysis and language translation
- Authentication with session-based user management

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Environment Variables

The application requires the following environment variables:

```
# Database connection
DATABASE_URL=postgresql://username:password@localhost:5432/ipcr

# Authentication
SESSION_SECRET=your_session_secret

# OpenAI integration
OPENAI_API_KEY=your_openai_api_key

# USGS Earth Explorer API (for satellite imagery)
EROS_USERNAME=your_eros_username
EROS_PASSWORD=your_eros_password
EROS_API_KEY=your_eros_api_key

# Optional social media integrations
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/username/ipcr-early-warning-system.git
cd ipcr-early-warning-system
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

This will start both the Express.js server and the React frontend using Vite.

## License

This project is proprietary and confidential.

## Credits

Designed and developed for the Institute for Peace and Conflict Resolution (IPCR) by [afrinict.com](https://afrinict.com)