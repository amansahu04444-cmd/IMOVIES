const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup supporting multiple origins, trailing slashes, and Render subdomains
const rawClientUrls = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [];
const configuredOrigins = rawClientUrls
  .map(url => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const defaultOrigins = [
  'https://imovies-self.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultOrigins]));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, tests) where origin is undefined
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // Allow Render subdomains (*.onrender.com) and Vercel domains (*.vercel.app)
    let isAllowedCloudDomain = false;
    try {
      const parsedHost = new URL(origin).hostname;
      isAllowedCloudDomain = /\.onrender\.com$/i.test(parsedHost) || /\.vercel\.app$/i.test(parsedHost);
    } catch (e) {
      isAllowedCloudDomain = false;
    }

    if (process.env.NODE_ENV !== 'production' || isAllowedCloudDomain) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API with database status
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const isDbConnected = dbState === 1;

  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'ok' : 'degraded',
    service: 'IMovies REST API',
    uptime: process.uptime(),
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      connected: isDbConnected
    },
    timestamp: new Date().toISOString()
  });
});

// Root API overview
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'IMovies REST API',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// Database connectivity check middleware for data-dependent routes
const checkDatabase = (req, res, next) => {
  // Allow health check, root info endpoint, and non-API paths
  if (req.path === '/health' || req.path === '/' || !req.originalUrl.startsWith('/api')) {
    return next();
  }

  const dbState = mongoose.connection.readyState;
  // 1 = connected: proceed immediately
  if (dbState === 1) {
    return next();
  }

  // 2 = connecting: Mongoose automatically buffers queries while connecting
  if (dbState === 2) {
    return next();
  }

  // 0 = disconnected or 3 = disconnecting: trigger background reconnection attempt
  if (dbState === 0) {
    connectDB().catch((err) => {
      console.error(`[Database Auto-Reconnect] Background connection attempt failed: ${err.message}`);
    });
  }

  return res.status(503).json({
    success: false,
    errorType: 'DATABASE_UNAVAILABLE',
    message: 'Could not connect to cinema database. Please ensure backend is running.'
  });
};

app.use('/api', checkDatabase);

// Health check alias at root level
app.get('/health', (req, res) => {
  res.redirect('/api/health');
});

// Route imports
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const theatreRoutes = require('./routes/theatreRoutes');
const showRoutes = require('./routes/showRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Mount canonical /api routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// Compatibility aliases without /api prefix
app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);
app.use('/theatres', theatreRoutes);
app.use('/shows', showRoutes);
app.use('/bookings', bookingRoutes);
app.use('/admin', adminRoutes);
app.use('/reviews', reviewRoutes);

// In production, optionally serve client build if available (unified full-stack deployment)
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../Client/dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Background reconnect utility if initial startup connection failed
const startDatabaseReconnectionLoop = () => {
  const interval = setInterval(async () => {
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
      clearInterval(interval);
      return;
    }
    try {
      console.log('[Database Recovery] Attempting to reconnect to MongoDB...');
      await connectDB();
      console.log('[Database Recovery] Successfully established connection to MongoDB!');
      clearInterval(interval);
    } catch (err) {
      console.warn(`[Database Recovery] Reconnection attempt failed: ${err.message}. Retrying...`);
    }
  }, 10000);

  if (interval.unref) interval.unref();
};

// Start server if run directly
if (require.main === module) {
  connectDB()
    .then(() => {
      console.log('[Database] Initial connection verified.');
    })
    .catch((err) => {
      console.error(`[Database Warning] Initial MongoDB connection failed: ${err.message}. Starting web server with recovery loop...`);
      startDatabaseReconnectionLoop();
    })
    .finally(() => {
      app.listen(PORT, () => {
        console.log(`[Server] IMovies API server running on port ${PORT}`);
      });
    });
}

module.exports = app;

