// Custom error class for API errors
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Function to handle errors in async controllers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message } = err;

  // Log error
  console.error(`Error: ${err.name} - ${err.message}`);
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Server Error' : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Not found middleware
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Not Found - ${req.originalUrl}`
  });
};

module.exports = {
  ApiError,
  asyncHandler,
  errorHandler,
  notFound
};