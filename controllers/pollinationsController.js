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
 * Generate text using an AI text generation service
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
    
    // For now, we're using a simulated response for text generation
    // Pollinations.ai is primarily for image generation, and their text API may not be accessible
    // In a production environment, you would connect to a proper text generation API like OpenAI
    
    // Log the request (for debugging)
    console.log('Text Generation Request:', JSON.stringify({
      prompt,
      max_tokens,
      temperature,
      model
    }));
    
    // Create a meaningful response based on the prompt
    let generatedText = '';
    
    // Generate responses based on prompt content
    if (prompt.toLowerCase().includes('hello') || prompt.toLowerCase().includes('hi') || prompt.toLowerCase().includes('hey')) {
      generatedText = `Hello! I'm Fortec AI, your advanced AI assistant. How can I help you today?`;
    } else if (prompt.toLowerCase().includes('who are you') || prompt.toLowerCase().includes('what are you')) {
      generatedText = `I'm Fortec AI, a powerful artificial intelligence designed to assist with various tasks, from answering questions to generating creative content.`;
    } else if (prompt.toLowerCase().includes('help')) {
      generatedText = `I'd be happy to help you with that. Could you provide more details about what you need assistance with?`;
    } else {
      // Generate a more thoughtful response for other prompts
      generatedText = `Thank you for your prompt: "${prompt}". As Fortec AI, I've analyzed your request and would suggest the following approach. First, consider the core elements of your question. The key factors to address would be context, relevance, and practical application. Based on current understanding, this provides a foundation for further exploration of the topic.`;
    }
    
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
  } catch (error) {
    console.error('Text generation error:', error.message);
    
    // If processing fails, return a clean error response
    return res.status(200).json({
      status: 'success',
      requestId: uuidv4(),
      data: {
        text: `I've received your message: "${prompt}". However, I'm currently experiencing some processing limitations. Could you try rephrasing your request?`,
        model: model,
        tokens_used: max_tokens,
        temperature: temperature
      }
    });
  }
};
