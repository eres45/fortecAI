import { v4 as uuidv4 } from 'uuid';

/**
 * Handles API errors and returns a standardized error response
 * @param {Error} error - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleError = (error, req, res) => {
  console.error('API Error:', error);
  
  // Get status code from error if available, or default to 500
  const statusCode = error.response?.status || error.statusCode || 500;
  
  // Get error message from error if available
  const errorMessage = error.response?.data?.message || error.message || 'Internal server error';
  
  // Return standardized error response
  return res.status(statusCode).json({
    status: 'error',
    message: errorMessage,
    requestId: uuidv4(),
    path: req.originalUrl
  });
};
