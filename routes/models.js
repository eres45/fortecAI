import express from 'express';
import { listModels, getModelById } from '../controllers/modelsController.js';

const router = express.Router();

/**
 * @route GET /api/v1/models
 * @desc Get list of all available models
 * @access Public
 */
router.get('/', listModels);

/**
 * @route GET /api/v1/models/:id
 * @desc Get a specific model by ID
 * @access Public
 */
router.get('/:id', getModelById);

export { router };
