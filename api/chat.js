// Vercel Serverless Function: api/chat.js
// Secure server-side multi-provider AI proxy with key rotation & auto-failover

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { provider, model, systemPrompt, messages, userKey } = req.body;

  // Retrieve environment keys (supports comma-separated multiple keys for failover)
  const envKeyMap = {
    groq: process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || userKey,
    nvidia: process.env.NVIDIA_API_KEYS || process.env.NVIDIA_API_KEY || userKey,
    openrouter: process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY || userKey,
    gemini: process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || userKey,
    openai: process.env.OPENAI_API_KEY || userKey,
    claude: process.env.ANTHROPIC_API_KEY || userKey,
    grok: process.env.GROK_API_KEY || userKey,
    deepseek: process.env.DEEPSEEK_API_KEY || userKey
  };

  const activeKeyRaw = envKeyMap[provider];
  if (!activeKeyRaw) {
    return res.status(400).json({ error: `No API key configured for provider: ${provider}` });
  }

  const keys = activeKeyRaw.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...(messages || [])
  ];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      if (provider === 'groq') {
        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: model || 'groq/compound-mini',
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
        return res.status(200).json({ text: data.choices[0]?.message?.content || '', provider: `GROQ (${model})` });
      }

      if (provider === 'nvidia') {
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
        return res.status(200).json({ text: data.choices[0]?.message?.content || '', provider: `NVIDIA (${model})` });
      }

      if (provider === 'openrouter') {
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
        return res.status(200).json({ text: data.choices[0]?.message?.content || '', provider: `OpenRouter (${model})` });
      }

      if (provider === 'gemini') {
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
    } catch (err) {
      console.warn(`[Failover] Key ${i + 1}/${keys.length} for ${provider} failed:`, err.message);
      if (i === keys.length - 1) {
        return res.status(500).json({ error: `All keys for ${provider} failed: ${err.message}` });
      }
    }
  }
}
