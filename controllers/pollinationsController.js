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
    
    // Log the request (for debugging)
    console.log('Pollinations Image API Request:', JSON.stringify({ prompt, model, width, height }));
    
    // Build the URL based on the model
    let imageUrl;
    
    if (model === 'midjourney' || model === 'dalle' || model === 'playground') {
      // For these models, include the model name in the URL
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${model}&width=${width}&height=${height}`;
    } else {
      // Default to stable-diffusion
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}`;
    }
    
    // Make a GET request to verify the image exists (optional)
    await axios.get(imageUrl, { responseType: 'arraybuffer' }).catch(error => {
      console.log('Image preview check failed, but this is expected. Continuing.', error.message);
    });
    
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
    const { prompt, max_tokens = 150, temperature = 0.7, model = 'openai', voice = '' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        status: 'error',
        message: 'Prompt is required',
        requestId: uuidv4()
      });
    }
    
    // Store prompt in this scope for error handlers to access
    const userPrompt = prompt;
    // Store original model for tracking fallbacks
    const originalModel = model;
    let actualModel = model;
    
    // Log the request (for debugging)
    console.log('Pollinations Text API Request:', JSON.stringify({
      prompt: userPrompt,
      model,
      temperature
    }));
    
    // Build the appropriate URL based on the model type
    let requestUrl;
    let isAudioRequest = false;
    const encodedPrompt = encodeURIComponent(userPrompt);
    
    if (model === 'openai-audio') {
      // Handle audio generation requests
      isAudioRequest = true;
      const audioParams = new URLSearchParams({
        model: 'openai-audio',
        voice: voice || 'alloy' // default voice if not specified
      });
      requestUrl = `https://text.pollinations.ai/${encodedPrompt}?${audioParams.toString()}`;
    } else {
      // Handle text generation requests
      const params = new URLSearchParams({
        model, // Use the specified model
        json: 'true', // Get JSON response
        referrer: 'fortecai.vercel.app',
        temperature: temperature.toString(),
        max_tokens: max_tokens.toString()
      });
      // Ensure model parameter is explicitly included in the URL path for Pollinations API
      requestUrl = `https://text.pollinations.ai/${encodedPrompt}?${params.toString()}`;
    }
    
    // Make request to Pollinations.ai API
    let response;
    try {
      response = await axios.get(requestUrl, {
        headers: {
          'Accept': isAudioRequest ? 'audio/mpeg' : 'application/json'
        },
        responseType: isAudioRequest ? 'arraybuffer' : 'json',
        timeout: 60000 // 60 second timeout
      });
    } catch (apiError) {
      console.log('Pollinations API Error:', apiError.response?.data || apiError.message);
      throw new Error(`The ${model} model is not available currently. Please try again later or choose a different model.`);
    }
    
    // Handle audio response
    if (isAudioRequest) {
      // For audio, we'd typically return a URL to the audio file or a base64 encoding
      // Since we can't easily store files here, we'll return the raw base64 data
      const audioBase64 = Buffer.from(response.data).toString('base64');
      return res.status(200).json({
        status: 'success',
        requestId: uuidv4(),
        data: {
          text: { response: 'Audio generated successfully', model: 'openai-audio' },
          audio_data: `data:audio/mpeg;base64,${audioBase64}`,
          model: 'openai-audio',
          voice: voice || 'alloy'
        }
      });
    }
    
    // Parse the JSON response for text generation
    let jsonResponse;
    try {
      // If the response is a string, parse it
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
    
    // Extract the model information to return to the client
    console.log('Full jsonResponse:', JSON.stringify(jsonResponse));
    
    // Check if the response is incomplete (just a model name without text content)
    const hasIncompleteResponse = jsonResponse && 
                                 (jsonResponse.model || jsonResponse.model_name) && 
                                 !(jsonResponse.text || jsonResponse.content || jsonResponse.response || jsonResponse.message);
    
    if (hasIncompleteResponse) {
      console.log('Incomplete response detected for model:', model);
    }
    
    // Provide clear information about the model used
    const displayModelName = jsonResponse.model_name || jsonResponse.model || model;
    
    // Determine the actual text content to return
    let responseText;
    if (jsonResponse.text || jsonResponse.content || jsonResponse.response || jsonResponse.message) {
      // We have actual text content from the API
      responseText = jsonResponse.text || jsonResponse.content || jsonResponse.response || jsonResponse.message;
      // Ensure we're returning a string, not an object
      if (typeof responseText === 'object' && responseText !== null) {
        console.log('Converting response object to string:', responseText);
        responseText = JSON.stringify(responseText);
      }
    } else if (jsonResponse.model || jsonResponse.model_name) {
      // Just model information without text content
      responseText = `The ${displayModelName} model is not available currently. Please try again later or choose a different model.`;
    } else {
      // Completely empty response
      responseText = `The ${displayModelName} model is not available currently. Please try again later or choose a different model.`;
    }
    
    // Log what we're actually returning to help debug
    console.log('Sending response to client:', responseText);
    
    // For message property responses, create a properly structured object
    let formattedText;
    if (jsonResponse.message && typeof jsonResponse.message === 'string') {
      formattedText = jsonResponse.message;
    } else {
      formattedText = responseText;
    }
    
    // Return the formatted response with all information
    return res.status(200).json({
      status: 'success',
      requestId: uuidv4(),
      data: {
        text: formattedText,
        model: model,
        requested_model: model,
        tokens_used: jsonResponse.usage?.total_tokens || max_tokens,
        temperature: temperature,
        // Include any model information from the response
        model_name: displayModelName
      }
    });
  } catch (error) {
    console.error('Pollinations API Error:', error.response?.data || error.message);
    
    // Get parameters from request body for error handling
    const model = req.body.model || 'fortec-lite';
    
    // Return error message that model is not available
    return res.status(200).json({
      status: 'error',
      requestId: uuidv4(),
      data: {
        text: `The ${model} model is not available currently. Please try again later or choose a different model.`,
        model: model,
        model_name: model
      }
    });
  }
};
