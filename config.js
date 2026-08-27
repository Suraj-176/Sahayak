/**
 * Sahayak Civic Assistant — Master Configuration & API Keys
 * Author: Suraj Yadav
 */

window.SAHAYAK_CONFIG = {
  // 1. Groq Cloud API Keys (High-Speed LPU Inference)
  GROQ_KEYS: [
    "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",
    "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",
    "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",
    "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"
  ],

  // 2. NVIDIA NIM API Keys
  NVIDIA_KEYS: [
    "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"
  ],

  // 3. OpenRouter API Keys (Multi-Model Hub)
  OPENROUTER_KEYS: [
    "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",
    "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"
  ],

  // 4. Google Gemini API Keys (Optional)
  GEMINI_KEYS: [],

  // 5. OpenAI / DeepSeek / Claude Keys (Optional)
  OPENAI_KEYS: [],
  DEEPSEEK_KEYS: [],
  CLAUDE_KEYS: [],

  // Active Models in Failover Priority
  GROQ_MODELS: [
    "openai/gpt-oss-120b",
    "groq/compound",
    "qwen/qwen3.6-27b",
    "groq/compound-mini",
    "openai/gpt-oss-20b"
  ],

  OPENROUTER_MODELS: [
    "openrouter/free",
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-3.5-lightning:free"
  ],

  NVIDIA_MODELS: [
    "deepseek-ai/deepseek-v4-flash-0731",
    "google/gemma-4-31b-it",
    "ibm/granite-3.0-8b-instruct"
  ],

  // Default Auto-Failover Provider Priority
  PROVIDER_ORDER: ["groq", "openrouter", "nvidia", "gemini"]
};
