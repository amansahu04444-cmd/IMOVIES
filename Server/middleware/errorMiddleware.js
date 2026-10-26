// 404 handler for unmatched routes
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Central error handler
const errorHandler = (err, req, res, next) => {
  // If status code is 200, default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Format response JSON
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { notFound, errorHandler };
