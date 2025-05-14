# Fortec AI API Server

This is the backend API server for Fortec AI, providing endpoints for AI model interactions and user management.

## Setup

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create `.env` file from `.env.example`
5. Start the server:
   ```
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login a user
- `POST /api/v1/auth/api-key` - Generate a new API key
- `POST /api/v1/auth/verify` - Verify an API key

### Models

- `GET /api/v1/models` - Get a list of all available models
- `GET /api/v1/models/:id` - Get details of a specific model

### Generation (Free Tier)

- `POST /api/v1/generate/image` - Generate an image using pollinations.ai
- `POST /api/v1/generate/text` - Generate text

## API Authentication

All requests to protected endpoints must include an API key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY
```

## Rate Limiting

API requests are rate-limited based on user tier:

- Free tier: 50 requests per 15 minutes
- Standard tier: 200 requests per 15 minutes
- Pro tier: 500 requests per 15 minutes
- Premium tier: 1000 requests per 15 minutes

## Deployment

The API server is set up for deployment on Render using the `render.yaml` configuration file.

## Example Request - Image Generation

```bash
curl -X POST "https://api.fortecai.com/api/v1/generate/image" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "prompt": "A beautiful mountain landscape with a lake",
    "width": 512,
    "height": 512,
    "model": "stable-diffusion"
  }'
```

## Example Request - Text Generation

```bash
curl -X POST "https://api.fortecai.com/api/v1/generate/text" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "prompt": "Write a short story about an AI that becomes sentient",
    "max_tokens": 150,
    "temperature": 0.7,
    "model": "fortec-lite"
  }'
```
