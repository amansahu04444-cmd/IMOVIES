const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers for Atlas SRV resolution on Windows environments
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {
    // Fall back to system DNS
  }
}

// Safely sanitize database connection URI or error messages to prevent credential leaks
const sanitizeErrorMessage = (msg) => {
  if (!msg || typeof msg !== 'string') return '';
  return msg.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/gi, 'mongodb$1://$2:****@');
};

// Database connection lifecycle listeners
mongoose.connection.on('connected', () => {
  console.log(`[Database] MongoDB connection established successfully`);
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database Event] MongoDB connection error: ${sanitizeErrorMessage(err.message)}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn(`[Database Event] MongoDB disconnected. Auto-reconnection in progress...`);
});

mongoose.connection.on('reconnected', () => {
  console.log(`[Database Event] MongoDB reconnected successfully`);
});

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  let mongoUri = process.env.MONGODB_URI;

  if (isProduction) {
    if (!mongoUri || mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
      const configError = new Error(
        '[Database Config Error] Production environment requires a valid remote MONGODB_URI (e.g. MongoDB Atlas). Localhost is prohibited in production.'
      );
      console.error(configError.message);
      throw configError;
    }
  } else {
    mongoUri = mongoUri || 'mongodb://127.0.0.1:27017/imovies';
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${sanitizeErrorMessage(error.message)}`);
    throw error;
  }
};

module.exports = connectDB;

