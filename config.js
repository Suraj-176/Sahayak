// ==============================================================================
// SAHAYAK CIVIC ASSISTANT - FREE AI TOKENS CONFIGURATION
// ==============================================================================
// Pre-configured with your pool of verified working free keys and model fallbacks.

window.SAHAYAK_CONFIG = {
  // 1. Groq Keys (Verified Active Pool)
  GROQ_KEYS: [
    "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",
    "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",
    "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",
    "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"
  ],
  // Active Groq models in fallback order
  GROQ_MODELS: [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "deepseek-r1-distill-llama-70b",
    "groq/compound-mini",
    "openai/gpt-oss-120b",
    "qwen/qwen3.6-27b"
  ],

  // 2. NVIDIA NIM Keys (Free at https://build.nvidia.com)
  // Paste your nvapi-... keys here:
  NVIDIA_KEYS: [
    "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"
  ],
  NVIDIA_MODELS: [
    "meta/llama-3.3-70b-instruct",
    "nvidia/llama-3.1-nemotron-70b-instruct",
    "meta/llama-3.1-8b-instruct",
    "mistralai/mistral-large-2-instruct",
    "deepseek-ai/deepseek-r1"
  ],

  // 3. OpenRouter Keys (Verified Active Pool)
  OPENROUTER_KEYS: [
    "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",
    "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"
  ],
  // Active OpenRouter models in fallback order
  OPENROUTER_MODELS: [
    "openrouter/free",
    "nvidia/nemotron-3.5-lightning:free",
    "google/gemma-4-31b-it:free",
    "liquid/lfm-2.5-2.6b:free"
  ],

  // 4. Google Gemini Keys (Optional Free Tier - https://aistudio.google.com/app/apikey)
  GEMINI_KEYS: [],
  GEMINI_MODELS: ["gemini-2.0-flash", "gemini-1.5-flash"],

  // 5. Other Optional Keys (OpenAI, Claude, xAI Grok, DeepSeek)
  OPENAI_KEYS: [],
  CLAUDE_KEYS: [],
  GROK_KEYS: [],
  DEEPSEEK_KEYS: [],

  // Priority order for automatic rotation & rate-limit failover
  PROVIDER_ORDER: ["groq", "nvidia", "openrouter", "gemini", "openai", "claude", "grok", "deepseek"]
};
