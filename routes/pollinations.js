import express from 'express';
import { generateImage, generateText } from '../controllers/pollinationsController.js';

const router = express.Router();

/**
 * @route POST /api/v1/generate/image
 * @desc Generate an image using pollinations.ai
 * @access Public
 */
router.post('/image', generateImage);

/**
 * @route POST /api/v1/generate/text
 * @desc Generate text using pollinations.ai
 * @access Public
 */
router.post('/text', generateText);

export { router };
