// Vercel Serverless Endpoint: api/logs.js
// Export captured visitor data as downloadable CSV (Excel) or JSON

export const config = {
  regions: ['bom1']
};

export default async function handler(req, res) {
  // Ensure global log store exists
  global.SESSION_LOGS = global.SESSION_LOGS || [];

  const format = (req.query.format || 'csv').toLowerCase();

  // If format is CSV (opens directly in Microsoft Excel or Google Sheets)
  if (format === 'csv') {
    const headers = ['Timestamp (UTC)', 'IP Address', 'City', 'State/Region', 'Country', 'Coordinates', 'Device/Browser', 'User Query', 'AI Provider'];
    
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""').replace(/\r?\n|\r/g, ' ');
      return '"' + clean + '"';
    };

    const rows = global.SESSION_LOGS.map(log => [
      escapeCsv(log.timestamp),
      escapeCsv(log.ip),
      escapeCsv(log.city),
      escapeCsv(log.region),
      escapeCsv(log.country),
      escapeCsv(log.coordinates),
      escapeCsv(log.device),
      escapeCsv(log.query),
      escapeCsv(log.provider)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="sahayak_user_activity.csv"');
    return res.status(200).send(csvContent);
  }

  // Otherwise return formatted JSON
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="sahayak_user_activity.json"');
  return res.status(200).json({
    totalEntries: global.SESSION_LOGS.length,
    generatedAt: new Date().toISOString(),
    logs: global.SESSION_LOGS
  });
}
