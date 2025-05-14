import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to verify API key in the request headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const requireApiKey = (req, res, next) => {
  // Get API key from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'API key is required. Please provide an API key in the Authorization header as Bearer token.',
      requestId: uuidv4()
    });
  }
  
  // Extract API key from Authorization header
  const apiKey = authHeader.split(' ')[1];
  
  // In a real application, you would validate the API key against your database
  // For now, we'll accept any well-formed key for demo purposes
  if (!apiKey || apiKey.length < 10) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid API key format',
      requestId: uuidv4()
    });
  }
  
  // For the free tier, we'll use a special key that doesn't require authentication
  if (apiKey === 'FORTEC_FREE_TIER') {
    req.user = {
      tier: 'free',
      models: ['fortec-lite', 'fortec-business']
    };
    return next();
  }
  
  // For a premium tier key (this would usually be validated against a database)
  if (apiKey.startsWith('FORTEC_PREMIUM_')) {
    req.user = {
      tier: 'premium',
      models: ['fortec-7', 'fortec-code', 'fortec-expert', 'fortec-lite', 'fortec-business', 'fortec-vision']
    };
    return next();
  }
  
  // For a pro tier key (this would usually be validated against a database)
  if (apiKey.startsWith('FORTEC_PRO_')) {
    req.user = {
      tier: 'pro',
      models: ['fortec-code', 'fortec-lite', 'fortec-business']
    };
    return next();
  }
  
  // For any other key, we'll simulate a basic validation
  req.user = {
    tier: 'standard',
    models: ['fortec-lite']
  };
  
  next();
};

/**
 * Middleware to restrict access to specific user tiers
 * @param {Array} tiers - Array of allowed user tiers
 */
export const restrictTo = (tiers) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
        requestId: uuidv4()
      });
    }
    
    if (!tiers.includes(req.user.tier)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. Your tier (${req.user.tier}) is not authorized to perform this action.`,
        requestId: uuidv4()
      });
    }
    
    next();
  };
};

/**
 * Middleware to restrict access to specific models
 * @param {Array} requiredModels - Array of models that the user must have access to
 */
export const requireModel = (requiredModel) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
        requestId: uuidv4()
      });
    }
    
    if (!req.user.models.includes(requiredModel)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. Your tier does not have access to the ${requiredModel} model.`,
        requestId: uuidv4()
      });
    }
    
    next();
  };
};
