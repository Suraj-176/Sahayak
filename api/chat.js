// Vercel Serverless Function: api/chat.js
// Secure server-side multi-provider AI proxy with key rotation & auto-failover

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { provider, model, systemPrompt, messages, userKey } = req.body;

  // Retrieve environment keys (supports all naming aliases and comma-separated multiple keys)
  const envKeyMap = {
    groq: process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || process.env.GROQ_KEYS || process.env.GROQ_KEY || userKey,
    nvidia: process.env.NVIDIA_API_KEYS || process.env.NVIDIA_API_KEY || process.env.NVIDIA_KEYS || process.env.NVIDIA_KEY || userKey,
    openrouter: process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEYS || process.env.OPENROUTER_KEY || userKey,
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
    return res.status(400).json({ error: `No API keys found in Vercel Environment Variables. Please add GROQ_API_KEYS or NVIDIA_API_KEYS in Vercel Settings -> Environment Variables.` });
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

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      if (activeProvider === 'groq') {
        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: model || 'llama-3.3-70b-versatile',
            messages: formattedMessages,
            temperature: 0.3,
            max_tokens: 1200
          })
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        return res.status(200).json({ text: data.choices[0]?.message?.content || '', provider: `GROQ (${model || 'llama-3.3-70b-versatile'})` });
      }

      if (activeProvider === 'nvidia') {
        const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: model || 'meta/llama-3.3-70b-instruct',
            messages: formattedMessages,
            temperature: 0.3,
            max_tokens: 1200
          })
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        return res.status(200).json({ text: data.choices[0]?.message?.content || '', provider: `NVIDIA (${model || 'meta/llama-3.3-70b-instruct'})` });
      }

      if (activeProvider === 'openrouter') {
        const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
            'HTTP-Referer': 'https://sahayak.app',
            'X-Title': 'Sahayak Civic Assistant'
          },
          body: JSON.stringify({
            model: model || 'openrouter/free',
            messages: formattedMessages,
            temperature: 0.3,
            max_tokens: 1200
          })
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        return res.status(200).json({ text: data.choices[0]?.message?.content || '', provider: `OpenRouter (${model || 'openrouter/free'})` });
      }

      if (activeProvider === 'gemini') {
        const cleanModel = model || 'gemini-2.0-flash';
        const contents = (messages || []).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: contents,
            generationConfig: { maxOutputTokens: 1200, temperature: 0.3 }
          })
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        return res.status(200).json({ text: data.candidates?.[0]?.content?.parts?.[0]?.text || '', provider: `Gemini (${cleanModel})` });
      }

      if (activeProvider === 'openai' || activeProvider === 'grok' || activeProvider === 'deepseek') {
        const endpoints = {
          openai: 'https://api.openai.com/v1/chat/completions',
          grok: 'https://api.x.ai/v1/chat/completions',
          deepseek: 'https://api.deepseek.com/v1/chat/completions'
        };
        const resp = await fetch(endpoints[activeProvider], {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: model || 'gpt-4o-mini',
            messages: formattedMessages,
            temperature: 0.3,
            max_tokens: 1200
          })
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        return res.status(200).json({ text: data.choices[0]?.message?.content || '', provider: `${activeProvider.toUpperCase()} (${model || 'default'})` });
      }

      if (activeProvider === 'claude') {
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: model || 'claude-3-7-sonnet-20250219',
            system: systemPrompt,
            messages: messages || [],
            max_tokens: 1200
          })
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        return res.status(200).json({ text: data.content?.[0]?.text || '', provider: `Claude (${model || 'claude-3-7-sonnet'})` });
      }
    } catch (err) {
      console.warn(`[Failover] Key ${i + 1}/${keys.length} for ${activeProvider} failed:`, err.message);
      if (i === keys.length - 1) {
        return res.status(500).json({ error: `All keys for ${activeProvider} failed: ${err.message}` });
      }
    }
  }
}
