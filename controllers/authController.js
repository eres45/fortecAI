import { v4 as uuidv4 } from 'uuid';
import { handleError } from '../utils/errorHandler.js';

// In a production app, you would use a proper database
// This is just a simple in-memory store for demonstration purposes
const users = [];
const apiKeys = [];

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email, and password',
        requestId: uuidv4()
      });
    }
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists',
        requestId: uuidv4()
      });
    }
    
    // Create new user (in a real app, you would hash the password)
    const userId = uuidv4();
    const newUser = {
      id: userId,
      name,
      email,
      password, // In production, this would be hashed
      created_at: new Date().toISOString()
    };
    
    // Save user to our "database"
    users.push(newUser);
    
    // Generate API key for the new user
    const apiKey = uuidv4();
    apiKeys.push({
      key: apiKey,
      user_id: userId,
      created_at: new Date().toISOString()
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      requestId: uuidv4(),
      data: {
        user: {
          id: userId,
          name,
          email,
          created_at: newUser.created_at
        },
        api_key: apiKey
      }
    });
  } catch (error) {
    return handleError(error, req, res);
  }
};

/**
 * Login a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password',
        requestId: uuidv4()
      });
    }
    
    // Find user in our "database"
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
        requestId: uuidv4()
      });
    }
    
    // Check password (in a real app, you would compare hashed passwords)
    if (user.password !== password) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
        requestId: uuidv4()
      });
    }
    
    // Find user's API key
    const apiKey = apiKeys.find(key => key.user_id === user.id);
    
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      requestId: uuidv4(),
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        },
        api_key: apiKey ? apiKey.key : null
      }
    });
  } catch (error) {
    return handleError(error, req, res);
  }
};

/**
 * Generate a new API key for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateApiKey = async (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required',
        requestId: uuidv4()
      });
    }
    
    // Check if user exists
    const user = users.find(user => user.id === user_id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        requestId: uuidv4()
      });
    }
    
    // Generate new API key
    const apiKey = uuidv4();
    
    // Save API key to our "database"
    apiKeys.push({
      key: apiKey,
      user_id,
      created_at: new Date().toISOString()
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'API key generated successfully',
      requestId: uuidv4(),
      data: {
        api_key: apiKey
      }
    });
  } catch (error) {
    return handleError(error, req, res);
  }
};

/**
 * Verify an API key
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const verifyApiKey = async (req, res) => {
  try {
    const { api_key } = req.body;
    
    if (!api_key) {
      return res.status(400).json({
        status: 'error',
        message: 'API key is required',
        requestId: uuidv4()
      });
    }
    
    // Check if API key exists
    const apiKeyObj = apiKeys.find(key => key.key === api_key);
    if (!apiKeyObj) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid API key',
        requestId: uuidv4()
      });
    }
    
    // Find user associated with API key
    const user = users.find(user => user.id === apiKeyObj.user_id);
    
    return res.status(200).json({
      status: 'success',
      message: 'API key is valid',
      requestId: uuidv4(),
      data: {
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    return handleError(error, req, res);
  }
};
