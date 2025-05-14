import express from 'express';
import { register, login, generateApiKey, verifyApiKey } from '../controllers/authController.js';

const router = express.Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', register);

/**
 * @route POST /api/v1/auth/login
 * @desc Login a user
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /api/v1/auth/api-key
 * @desc Generate a new API key
 * @access Private
 */
router.post('/api-key', generateApiKey);

/**
 * @route POST /api/v1/auth/verify
 * @desc Verify an API key
 * @access Public
 */
router.post('/verify', verifyApiKey);

export { router };
