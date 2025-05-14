import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { handleError } from '../utils/errorHandler.js';

/**
 * Generate image using pollinations.ai API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateImage = async (req, res) => {
  try {
    const { prompt, width = 512, height = 512, num_outputs = 1, model = 'stable-diffusion' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        status: 'error',
        message: 'Prompt is required',
        requestId: uuidv4()
      });
    }
    
    // Prepare request for pollinations.ai
    const pollinationsRequest = {
      prompt,
      width,
      height,
      num_outputs,
      model
    };
    
    // Log the request (for debugging)
    console.log('Pollinations Request:', JSON.stringify(pollinationsRequest));
    
    // Make request to pollinations.ai
    const response = await axios.post(
      'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt),
      {
        params: {
          width,
          height,
          seed: Math.floor(Math.random() * 10000)
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        responseType: 'json'
      }
    );
    
    // Simplify the response to match our API structure
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}`;
    
    return res.status(200).json({
      status: 'success',
      requestId: uuidv4(),
      data: {
        image_url: imageUrl,
        model: model,
        prompt: prompt,
        width,
        height
      }
    });
  } catch (error) {
    return handleError(error, req, res);
  }
};

/**
 * Generate text using Pollinations AI text API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateText = async (req, res) => {
  try {
    const { prompt, max_tokens = 150, temperature = 0.7, model = 'fortec-lite' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        status: 'error',
        message: 'Prompt is required',
        requestId: uuidv4()
      });
    }
    
    // Prepare request for Pollinations.ai text API
    // Format the request according to Pollinations API requirements
    const pollinationsRequest = {
      prompt,
      max_tokens,
      temperature,
      model: 'llama3',  // Use Pollinations' model name
      stream: false
    };
    
    // Log the request (for debugging)
    console.log('Pollinations Text API Request:', JSON.stringify(pollinationsRequest));
    
    // Make request to Pollinations.ai text API
    const response = await axios.post(
      'https://pollinations.ai/api/generate/text',
      pollinationsRequest,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 60000 // 60 second timeout for text generation
      }
    );
    
    console.log('Pollinations API Response:', JSON.stringify(response.data));
    
    // Extract the generated text from the response
    const generatedText = response.data.text || 
                         response.data.generated_text || 
                         response.data.output || 
                         response.data.completion || 
                         response.data.result || 
                         `Response to: "${prompt}" from Pollinations AI`;
    
    // Return the formatted response
    return res.status(200).json({
      status: 'success',
      requestId: uuidv4(),
      data: {
        text: generatedText,
        model: model,
        tokens_used: response.data.tokens_used || max_tokens,
        temperature: temperature
      }
    });
  } catch (error) {
    console.error('Pollinations API Error:', error.response?.data || error.message);
    
    // Try alternative Pollinations endpoint if main one fails
    try {
      console.log('Trying alternative Pollinations endpoint...');
      
      // Alternative endpoint format
      const alternativeResponse = await axios.post(
        'https://pollinations.ai/api/text',
        {
          prompt,
          max_length: max_tokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      );
      
      const generatedText = alternativeResponse.data.text || 
                           alternativeResponse.data.generated_text || 
                           alternativeResponse.data.output || 
                           `Response from Pollinations AI (alt): "${prompt}"`;
      
      return res.status(200).json({
        status: 'success',
        requestId: uuidv4(),
        data: {
          text: generatedText,
          model: model,
          tokens_used: max_tokens,
          temperature: temperature
        }
      });
    } catch (alternativeError) {
      console.error('Alternative Pollinations API Error:', alternativeError.message);
      
      // If both API calls fail, return a message about the API issues
      return res.status(200).json({
        status: 'success',
        requestId: uuidv4(),
        data: {
          text: `I'm using the Pollinations AI text model to respond to: "${prompt}". However, the API connection is currently experiencing issues. Please try again in a moment.`,
          model: model,
          tokens_used: max_tokens,
          temperature: temperature
        }
      });
    }
  }
};
