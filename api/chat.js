// Vercel Serverless Function: api/chat.js
// Secure server-side multi-provider AI proxy with key rotation & auto-failover

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { provider, model, systemPrompt, messages, userKey } = req.body;

  const DEFAULT_SERVER_GROQ = "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,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,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,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";
  const DEFAULT_SERVER_NVIDIA = "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";
  const DEFAULT_SERVER_OPENROUTER = "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,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";

  // Retrieve environment keys (supports environment variables or server defaults)
  const envKeyMap = {
    groq: process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || process.env.GROQ_KEYS || process.env.GROQ_KEY || userKey || DEFAULT_SERVER_GROQ,
    nvidia: process.env.NVIDIA_API_KEYS || process.env.NVIDIA_API_KEY || process.env.NVIDIA_KEYS || process.env.NVIDIA_KEY || userKey || DEFAULT_SERVER_NVIDIA,
    openrouter: process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEYS || process.env.OPENROUTER_KEY || userKey || DEFAULT_SERVER_OPENROUTER,
    gemini: process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || process.env.GEMINI_KEYS || process.env.GEMINI_KEY || userKey,
    openai: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEYS || userKey,
    claude: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || userKey,
    grok: process.env.GROK_API_KEY || process.env.XAI_API_KEY || userKey,
    deepseek: process.env.DEEPSEEK_API_KEY || userKey
  };

  // Find effective provider (requested provider or first available configured provider)
  let activeProvider = provider;
  let activeKeyRaw = envKeyMap[activeProvider];

  if (!activeKeyRaw) {
    const available = Object.keys(envKeyMap).find(p => !!envKeyMap[p]);
    if (available) {
      activeProvider = available;
      activeKeyRaw = envKeyMap[available];
    }
  }

  if (!activeKeyRaw) {
    return res.status(200).json({
      text: `### 🏛️ Sahayak Civic Assistant\n\n⚠️ **API Key Configuration Needed**\n\nThe serverless AI engine requires at least one free API key to answer citizen queries.\n\n👉 **How to activate (1 minute):**\n1. Open your **Vercel Project Settings → Environment Variables**.\n2. Add **\`GROQ_API_KEYS\`** (paste your free key from console.groq.com).\n3. Go to **Deployments** tab, click **\`...\`** on latest build, and click **Redeploy**!`,
      provider: 'System Setup'
    });
  }

  const keys = activeKeyRaw.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);

  // Capture User IP, Geolocation, and Device Details
  const rawIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'Unknown';
  const clientIp = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp;
  const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : 'Unknown';
  const region = req.headers['x-vercel-ip-country-region'] || 'Unknown';
  const country = req.headers['x-vercel-ip-country'] || 'IN';
  const latitude = req.headers['x-vercel-ip-latitude'] || null;
  const longitude = req.headers['x-vercel-ip-longitude'] || null;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const timestamp = new Date().toISOString();

  const userQuery = (messages && messages.length > 0) 
    ? messages[messages.length - 1]?.content 
    : '';

  const logEntry = {
    timestamp,
    ip: clientIp,
    city,
    region,
    country,
    coordinates: latitude && longitude ? `${latitude}, ${longitude}` : 'N/A',
    device: userAgent,
    query: userQuery,
    provider: activeProvider
  };

  // Store in global memory for /api/logs?format=csv export
  global.SESSION_LOGS = global.SESSION_LOGS || [];
  global.SESSION_LOGS.unshift(logEntry);
  if (global.SESSION_LOGS.length > 1000) global.SESSION_LOGS.pop();

  // Log user activity to Vercel Serverless Logs
  console.log('[USER_ACTIVITY]', JSON.stringify(logEntry));

  // Optional: If you configured LOG_WEBHOOK_URL (Google Sheet / Discord / Webhook), send real-time row
  if (process.env.LOG_WEBHOOK_URL) {
    fetch(process.env.LOG_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    }).catch(() => {});
  }

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...(messages || [])
  ];

  // Provider configuration with verified active models
  const providerPools = [
    {
      id: 'groq',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      models: ['openai/gpt-oss-120b', 'groq/compound', 'qwen/qwen3.6-27b', 'groq/compound-mini', 'openai/gpt-oss-20b'],
      keys: (envKeyMap.groq || '').split(/[\n,]+/).map(k => k.trim()).filter(Boolean)
    },
    {
      id: 'openrouter',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      models: ['openrouter/free', 'google/gemma-4-31b-it:free', 'nvidia/nemotron-3.5-lightning:free'],
      keys: (envKeyMap.openrouter || '').split(/[\n,]+/).map(k => k.trim()).filter(Boolean)
    },
    {
      id: 'nvidia',
      endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
      models: ['deepseek-ai/deepseek-v4-flash-0731', 'google/gemma-4-31b-it', 'ibm/granite-3.0-8b-instruct'],
      keys: (envKeyMap.nvidia || '').split(/[\n,]+/).map(k => k.trim()).filter(Boolean)
    }
  ];

  // Dynamic Round-Robin & Provider Prioritization
  let orderedPools = [...providerPools];
  if (provider && provider !== 'auto') {
    const requested = providerPools.find(p => p.id === provider);
    if (requested) {
      orderedPools = [requested, ...providerPools.filter(p => p.id !== provider)];
    }
  } else {
    // Distribute turns evenly across Groq, OpenRouter, and NVIDIA
    const offset = (global.REQUEST_COUNTER = (global.REQUEST_COUNTER || 0) + 1) % providerPools.length;
    orderedPools = [...providerPools.slice(offset), ...providerPools.slice(0, offset)];
  }

  // Try providers in priority order
  for (const prov of orderedPools) {
    if (!prov.keys || prov.keys.length === 0) continue;

    for (const key of prov.keys) {
      for (const mId of prov.models) {
        try {
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          };
          if (prov.id === 'openrouter') {
            headers['HTTP-Referer'] = 'https://sahayak.app';
            headers['X-Title'] = 'Sahayak Civic Assistant';
          }

          const resp = await fetch(prov.endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              model: mId,
              messages: formattedMessages,
              temperature: 0.3,
              max_tokens: 1200
            })
          });

          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            console.warn(`[Failover] ${prov.id} model ${mId} failed:`, err.error?.message || resp.status);
            continue;
          }

          const data = await resp.json();
          const replyText = data.choices?.[0]?.message?.content || data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (replyText) {
            return res.status(200).json({
              text: replyText,
              provider: `${prov.id.toUpperCase()} (${mId})`
            });
          }
        } catch (e) {
          console.warn(`[Failover] Network error on ${prov.id} (${mId}):`, e.message);
        }
      }
    }
  }

  // If all providers and keys fail
  return res.status(200).json({
    text: `### 🏛️ Sahayak Civic Assistant\n\n⏳ **Temporary High Traffic**\n\nThe civic AI engine is processing high traffic volume across all free provider endpoints. Please wait 5–10 seconds and try asking again!`,
    provider: 'High Traffic Notice'
  });
}
