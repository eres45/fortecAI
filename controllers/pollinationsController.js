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
    // Get parameters from request body
    const { prompt, max_tokens = 150, temperature = 0.7, model = 'fortec-lite' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        status: 'error',
        message: 'Prompt is required',
        requestId: uuidv4()
      });
    }
    
    // Store prompt in this scope for error handlers to access
    const userPrompt = prompt;
    
    // Log the request (for debugging)
    console.log('Pollinations Text API Request:', JSON.stringify({
      prompt: userPrompt,
      model: model === 'fortec-lite' ? 'openai' : model, // Map our model name to Pollinations model name
      temperature
    }));
    
    // Prepare the URL with all parameters properly URL encoded
    const encodedPrompt = encodeURIComponent(userPrompt);
    const params = new URLSearchParams({
      model: 'openai', // Use OpenAI model by default
      json: 'true',    // Get JSON response
      referrer: 'fortecai.vercel.app',
      temperature: temperature.toString()
    });
    
    // Build the URL for the GET request
    const requestUrl = `https://text.pollinations.ai/${encodedPrompt}?${params.toString()}`;
    
    // Make request to Pollinations.ai text API using their documented GET endpoint
    const response = await axios.get(requestUrl, {
      headers: {
        'Accept': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    // Parse the JSON response (Pollinations returns a JSON string)
    let jsonResponse;
    try {
      // If the response is a string, parse it (the API returns a JSON string)
      if (typeof response.data === 'string') {
        jsonResponse = JSON.parse(response.data);
      } else {
        jsonResponse = response.data;
      }
      console.log('Pollinations API Response parsed:', jsonResponse);
    } catch (parseError) {
      console.log('Response is plain text:', response.data);
      jsonResponse = { text: response.data };
    }
    
    // Return the formatted response
    return res.status(200).json({
      status: 'success',
      requestId: uuidv4(),
      data: {
        text: jsonResponse.text || jsonResponse.content || response.data || `Response to: "${userPrompt}"`,
        model: model,
        tokens_used: jsonResponse.usage?.total_tokens || max_tokens,
        temperature: temperature
      }
    });
  } catch (error) {
    console.error('Pollinations API Error:', error.response?.data || error.message);
    
    // Save the prompt from the request body for use in error handling
    const userPrompt = req.body.prompt || 'your query';
    const model = req.body.model || 'fortec-lite';
    const max_tokens = req.body.max_tokens || 150;
    const temperature = req.body.temperature || 0.7;
    
    // Try alternative Pollinations endpoint if main one fails
    try {
      console.log('Trying alternative Pollinations endpoint...');
      
      // Use URL encoding for the prompt in the URL path
      const encodedPrompt = encodeURIComponent(userPrompt);
      
      // Alternative documented endpoint with simpler parameters
      const alternativeResponse = await axios.get(
        `https://text.pollinations.ai/${encodedPrompt}`,
        {
          timeout: 15000 // shorter timeout for the fallback
        }
      );
      
      return res.status(200).json({
        status: 'success',
        requestId: uuidv4(),
        data: {
          text: alternativeResponse.data || `Response from Pollinations AI for: "${userPrompt}"`,
          model: model,
          tokens_used: max_tokens,
          temperature: temperature
        }
      });
    } catch (alternativeError) {
      console.error('Alternative Pollinations API Error:', alternativeError.message);
      
      // If both API calls fail, return a helpful message
      return res.status(200).json({
        status: 'success',
        requestId: uuidv4(),
        data: {
          text: `I'm Fortec AI processing your prompt: "${userPrompt}". Our connection to the Pollinations API is currently experiencing issues. This could be due to high demand or temporary service disruption. Please try again shortly.`,
          model: model,
          tokens_used: max_tokens,
          temperature: temperature
        }
      });
    }
  }
};
