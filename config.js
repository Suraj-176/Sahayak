/**
 * Sahayak Civic Assistant — Configuration Reference
 * 
 * For Production (Vercel):
 * All secret keys are configured safely in Vercel Settings -> Environment Variables.
 * 
 * For Local Standalone Development:
 * You can customize provider keys and fallback models below.
 */

window.SAHAYAK_CONFIG = {
  // Provider Priority Order
  PROVIDER_ORDER: ['groq', 'openrouter', 'nvidia', 'gemini'],

  // Active High-Speed Models
  GROQ_MODELS: [
    'openai/gpt-oss-120b',
    'groq/compound',
    'qwen/qwen3.6-27b',
    'groq/compound-mini',
    'openai/gpt-oss-20b'
  ],

  OPENROUTER_MODELS: [
    'openrouter/free',
    'google/gemma-4-31b-it:free',
    'nvidia/nemotron-3.5-lightning:free'
  ],

  NVIDIA_MODELS: [
    'deepseek-ai/deepseek-v4-flash-0731',
    'google/gemma-4-31b-it',
    'ibm/granite-3.0-8b-instruct'
  ]
};
