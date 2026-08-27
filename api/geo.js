// Vercel Serverless Endpoint: api/geo.js
// Returns visitor IP, city, state, country, and device info

export default async function handler(req, res) {
  const rawIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'Unknown';
  const clientIp = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp;
  const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : 'Unknown';
  const region = req.headers['x-vercel-ip-country-region'] || 'Unknown';
  const country = req.headers['x-vercel-ip-country'] || 'IN';
  const latitude = req.headers['x-vercel-ip-latitude'] || null;
  const longitude = req.headers['x-vercel-ip-longitude'] || null;
  const userAgent = req.headers['user-agent'] || 'Unknown';

  console.log('[VISIT]', JSON.stringify({
    timestamp: new Date().toISOString(),
    ip: clientIp,
    city,
    region,
    country,
    userAgent
  }));

  return res.status(200).json({
    ip: clientIp,
    city,
    region,
    country,
    latitude,
    longitude,
    userAgent
  });
}
