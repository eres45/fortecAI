/**
 * Available models configuration
 * This file defines all available AI models in the Fortec AI platform
 */
export const models = [
  {
    id: 'fortec-7',
    name: 'Fortec-7',
    description: 'Our most advanced model with exceptional capabilities across various domains.',
    version: '1.0',
    parameters: '175 billion',
    context_length: 32000,
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00002,
    max_requests_per_min: 1000,
    capabilities: [
      'natural-language-understanding',
      'code-generation',
      'reasoning',
      'problem-solving',
      'multilingual',
      'content-creation'
    ],
    specialization: 'general-purpose',
    is_premium: true,
    status: 'available',
    created_at: '2025-01-15T00:00:00Z'
  },
  {
    id: 'fortec-code',
    name: 'Fortec Code',
    description: 'Specialized for programming tasks with optimized capabilities for multiple languages.',
    version: '1.0',
    parameters: '35 billion',
    context_length: 16000,
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.00001,
    max_requests_per_min: 1500,
    capabilities: [
      'code-generation',
      'code-completion',
      'bug-detection',
      'code-refactoring',
      'code-explanation',
      'documentation-generation'
    ],
    specialization: 'programming',
    is_premium: false,
    status: 'available',
    created_at: '2025-02-01T00:00:00Z'
  },
  {
    id: 'fortec-expert',
    name: 'Fortec Expert',
    description: 'Optimized for analytical tasks requiring deeper subject matter expertise.',
    version: '1.0',
    parameters: '70 billion',
    context_length: 24000,
    input_cost_per_token: 0.000008,
    output_cost_per_token: 0.000015,
    max_requests_per_min: 500,
    capabilities: [
      'academic-research',
      'data-analysis',
      'technical-writing',
      'financial-modeling',
      'scientific-computing'
    ],
    specialization: 'analysis-research',
    is_premium: true,
    status: 'available',
    created_at: '2025-02-15T00:00:00Z'
  },
  {
    id: 'fortec-lite',
    name: 'Fortec Lite',
    description: 'Efficient, lightweight model designed for fast performance and basic tasks.',
    version: '1.0',
    parameters: '7 billion',
    context_length: 8000,
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000004,
    max_requests_per_min: 2000,
    capabilities: [
      'text-generation',
      'summarization',
      'question-answering',
      'sentiment-analysis',
      'language-translation'
    ],
    specialization: 'everyday-tasks',
    is_premium: false,
    status: 'available',
    created_at: '2025-03-01T00:00:00Z'
  },
  {
    id: 'fortec-business',
    name: 'Fortec Business',
    description: 'Purpose-built for business applications with enhanced security and compliance.',
    version: '1.0',
    parameters: '45 billion',
    context_length: 16000,
    input_cost_per_token: 0.000007,
    output_cost_per_token: 0.000012,
    max_requests_per_min: 800,
    capabilities: [
      'document-generation',
      'market-analysis',
      'feedback-processing',
      'content-creation',
      'email-drafting'
    ],
    specialization: 'business-operations',
    is_premium: false,
    status: 'available',
    created_at: '2025-03-15T00:00:00Z'
  },
  {
    id: 'fortec-vision',
    name: 'Fortec Vision',
    description: 'Cutting-edge multimodal model with advanced image understanding capabilities.',
    version: '1.0',
    parameters: '90 billion',
    context_length: 12000,
    image_support: true,
    input_cost_per_token: 0.00001,
    output_cost_per_token: 0.00002,
    image_cost_per_request: 0.002,
    max_requests_per_min: 400,
    capabilities: [
      'image-recognition',
      'visual-content-generation',
      'chart-interpretation',
      'image-description',
      'visual-reasoning'
    ],
    specialization: 'visual-understanding',
    is_premium: true,
    is_new: true,
    status: 'available',
    created_at: '2025-04-01T00:00:00Z'
  }
];
