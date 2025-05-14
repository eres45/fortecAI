import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a rate limiter with custom options
 * @param {Number} windowMs - Time window in milliseconds
 * @param {Number} max - Maximum number of requests in the time window
 * @param {String} message - Custom message to return when rate limited
 * @returns {Function} Express middleware function
 */
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message,
      requestId: uuidv4()
    },
    // Add user tier information to identify users and apply different limits
    keyGenerator: (req) => {
      // Use API key if available
      const apiKey = req.headers.authorization?.split(' ')[1] || '';
      // Get IP address as fallback
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      
      return apiKey || ip;
    }
  });
};

/**
 * Default API rate limiter
 */
export const apiLimiter = createRateLimiter();

/**
 * Tier-based rate limiters with different limits for different user tiers
 */
export const tierBasedLimiter = (req, res, next) => {
  // Get user tier from the authenticated user (set by authMiddleware)
  const tier = req.user?.tier || 'free';
  
  // Define rate limits for different tiers
  const limits = {
    free: createRateLimiter(15 * 60 * 1000, 50, 'Free tier rate limit exceeded'),
    standard: createRateLimiter(15 * 60 * 1000, 200, 'Standard tier rate limit exceeded'),
    pro: createRateLimiter(15 * 60 * 1000, 500, 'Pro tier rate limit exceeded'),
    premium: createRateLimiter(15 * 60 * 1000, 1000, 'Premium tier rate limit exceeded')
  };
  
  // Apply appropriate rate limiter based on user tier
  const limiter = limits[tier] || limits.free;
  return limiter(req, res, next);
};
