// server-mysql.js - Modified server entry point for MySQL support
// Import this file instead of original server.js in cPanel environment

const express = require('express');
const session = require('express-session');
const path = require('path');
const { db, pool } = require('./db-mysql');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// MySQL session store
const MySQLStore = require('express-mysql-session')(session);
const sessionStore = new MySQLStore({}, pool);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  if (req.session.userId) {
    try {
      const users = await db.execute('SELECT * FROM users WHERE id = ?', [req.session.userId]);
      
      if (users.length > 0) {
        req.user = users[0];
        return next();
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
    
    // Authentication failed
    req.session.destroy();
  }
  
  return res.status(401).json({ error: 'Unauthorized' });
};

// Public routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    const users = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Use proper password authentication with scrypt
    try {
      // Compare password using the stored hash
      // Format of password hash: hashedPassword.salt
      const [storedHash, salt] = user.password.split('.');
      
      // We need to use the crypto library to hash the provided password with the same salt
      const crypto = require('crypto');
      const hashedInputBuffer = crypto.scryptSync(password, salt, 64);
      const inputHashHex = hashedInputBuffer.toString('hex');
      
      // Compare the hashes
      if (inputHashHex === storedHash) {
        req.session.userId = user.id;
        delete user.password; // Don't send password to client
        return res.json(user);
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Password verification error:', error);
      return res.status(500).json({ error: 'Authentication error' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: 'Logged out successfully' });
});

app.get('/api/user', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const users = await db.execute('SELECT * FROM users WHERE id = ?', [req.session.userId]);
    
    if (users.length === 0) {
      req.session.destroy();
      return res.status(401).json({ error: 'User not found' });
    }
    
    const user = users[0];
    delete user.password; // Don't send password to client
    
    return res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Protected API routes - incidents
app.get('/api/incidents', authenticateUser, async (req, res) => {
  try {
    const incidents = await db.execute('SELECT * FROM incidents ORDER BY createdAt DESC');
    res.json(incidents);
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/incidents', authenticateUser, async (req, res) => {
  try {
    const { title, description, location, region, severity } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Format JSON fields
    const mediaUrls = req.body.mediaUrls ? JSON.stringify(req.body.mediaUrls) : '[]';
    const coordinates = req.body.coordinates ? JSON.stringify(req.body.coordinates) : null;
    
    const result = await db.execute(
      `INSERT INTO incidents 
       (title, description, location, region, severity, status, reportedBy, coordinates, mediaUrls)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, 
        description || '', 
        location || '', 
        region || '', 
        severity || 'medium', 
        'pending', 
        req.user.id,
        coordinates,
        mediaUrls
      ]
    );
    
    const [newIncident] = await db.execute('SELECT * FROM incidents WHERE id = ?', [result.insertId]);
    res.status(201).json(newIncident[0]);
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Additional API endpoints for core functionality

// Risk indicators
app.get('/api/risk-indicators', authenticateUser, async (req, res) => {
  try {
    const indicators = await db.execute('SELECT * FROM risk_indicators');
    res.json(indicators);
  } catch (error) {
    console.error('Get risk indicators error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Alerts
app.get('/api/alerts', authenticateUser, async (req, res) => {
  try {
    const alerts = await db.execute('SELECT * FROM alerts ORDER BY createdAt DESC');
    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Response plans
app.get('/api/response-plans', authenticateUser, async (req, res) => {
  try {
    const plans = await db.execute('SELECT * FROM response_plans ORDER BY createdAt DESC');
    res.json(plans);
  } catch (error) {
    console.error('Get response plans error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Data sources
app.get('/api/data-sources', authenticateUser, async (req, res) => {
  try {
    const sources = await db.execute('SELECT * FROM data_sources ORDER BY name ASC');
    res.json(sources);
  } catch (error) {
    console.error('Get data sources error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET a single incident by ID
app.get('/api/incidents/:id', authenticateUser, async (req, res) => {
  try {
    const [incidents] = await db.execute('SELECT * FROM incidents WHERE id = ?', [req.params.id]);
    
    if (incidents.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    res.json(incidents[0]);
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'mysql',
    version: '1.0.0'
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Handle frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});