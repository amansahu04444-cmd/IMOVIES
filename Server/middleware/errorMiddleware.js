// Sanitize any sensitive details (like database credentials) from error messages
const sanitizeErrorMessage = (msg) => {
  if (!msg || typeof msg !== 'string') return 'An error occurred';
  return msg.replace(/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/gi, 'mongodb$1://***:***@');
};

// 404 handler for unmatched routes
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.status = 404;
  error.errorType = 'NOT_FOUND';
  res.status(404);
  next(error);
};

// Central error handler
const errorHandler = (err, req, res, next) => {
  let statusCode = err.status || (res.statusCode === 200 ? 500 : res.statusCode);
  let errorType = err.errorType || 'SERVER_ERROR';

  // Identify MongoDB connection / network / server selection errors
  if (
    err.name === 'MongoNetworkError' ||
    err.name === 'MongooseServerSelectionError' ||
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongoTimeoutError' ||
    (err.message && err.message.toLowerCase().includes('buffering timed out'))
  ) {
    statusCode = 503;
    errorType = 'DATABASE_ERROR';
    err.message = 'Could not connect to cinema database. Please ensure backend database is accessible.';
  }

  // Format response JSON
  res.status(statusCode).json({
    success: false,
    errorType,
    message: sanitizeErrorMessage(err.message) || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { notFound, errorHandler };

