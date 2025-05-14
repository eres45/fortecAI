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

// Trust proxy - required when running behind a reverse proxy like Render
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Apply middleware - disable Helmet's default security for now to resolve CORS issues
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", '*.fortecai.vercel.app', '*.onrender.com'],
    connectSrc: ["'self'", '*'],
    imgSrc: ["'self'", '*'],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
  },
}));

// Add raw CORS headers to every response for simplicity
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Also keep standard CORS middleware as backup
app.use(cors({
  origin: '*', // Allow all origins for now to troubleshoot
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false // Set to false to avoid the withCredentials requirement
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
