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

## Technical Architecture

- React.js frontend with TypeScript and Leaflet for geospatial mapping
- PostgreSQL database for Replit development environment
- MySQL database for cPanel production deployment
- Advanced Pattern Detection module with AI-powered conflict analysis
- Comprehensive API integration with enhanced error handling

## Database Configuration

The system is designed to work with both PostgreSQL (for development) and MySQL (for production):

- **Development**: Uses PostgreSQL on Replit
- **Production**: Uses MySQL on cPanel with the following configuration:
  - Database: `ipcr-new`
  - Username: `admin`
  - Password: (stored securely in environment variables)

## Deployment Options

The system includes deployment scripts for:

1. AWS cloud deployment
2. Ubuntu desktop deployment
3. cPanel hosting (with and without SSH access)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (for development) or MySQL (for production)

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

3. Set up environment variables
```bash
# Create a .env file with the following variables
DATABASE_URL=postgresql://username:password@localhost:5432/ipcr
SESSION_SECRET=your_session_secret

# For social media integrations
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# For production MySQL (cPanel)
MYSQL_HOST=localhost
MYSQL_USER=admin
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=ipcr-new
```

4. Start the development server
```bash
npm run dev
```

## License

This project is proprietary and confidential.

## Credits

Designed and developed for the Institute for Peace and Conflict Resolution (IPCR) by [afrinict.com](https://afrinict.com)