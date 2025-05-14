import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { router as pollinationsRouter } from './routes/pollinations.js';
import { router as modelsRouter } from './routes/models.js';
import { router as authRouter } from './routes/auth.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Apply middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // List of allowed origins
    const allowedOrigins = [
      'https://fortecai.com', 
      'https://www.fortecai.com', 
      'https://fortecai.vercel.app', 
      'https://fortecai-40ktq3sin-eres-projects-3b5e8640.vercel.app',
      'https://fortecai-cfq16pweh-eres-projects-3b5e8640.vercel.app',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, origin); // Reflect the request origin in the response
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Apply rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests, please try again later.',
    requestId: () => uuidv4()
  }
});

// Base route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to Fortec AI API',
    documentation: '/api/docs',
    version: '1.0.0',
    requestId: uuidv4()
  });
});

// API routes
app.use('/api/v1/generate', apiLimiter, pollinationsRouter);
app.use('/api/v1/models', modelsRouter);
app.use('/api/v1/auth', authRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    requestId: uuidv4()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    requestId: uuidv4()
  });
});

// Not found middleware
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    requestId: uuidv4()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
