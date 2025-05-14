import { v4 as uuidv4 } from 'uuid';
import { handleError } from '../utils/errorHandler.js';
import { models } from '../config/models.js';

/**
 * Get a list of all available models
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const listModels = async (req, res) => {
  try {
    return res.status(200).json({
      status: 'success',
      requestId: uuidv4(),
      data: {
        models: models
      }
    });
  } catch (error) {
    return handleError(error, req, res);
  }
};

/**
 * Get details of a specific model by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getModelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const model = models.find(model => model.id === id);
    
    if (!model) {
      return res.status(404).json({
        status: 'error',
        message: `Model with ID ${id} not found`,
        requestId: uuidv4()
      });
    }
    
    return res.status(200).json({
      status: 'success',
      requestId: uuidv4(),
      data: {
        model
      }
    });
  } catch (error) {
    return handleError(error, req, res);
  }
};
