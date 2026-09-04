// Vercel Serverless Function for Overpass API
// Bypasses browser CORS & User-Agent restrictions

const MIRRORS = [
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let query = '';
  if (req.method === 'POST') {
    if (typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        query = parsed.query || req.body;
      } catch {
        query = req.body;
      }
    } else if (req.body && req.body.query) {
      query = req.body.query;
    }
  } else {
    query = req.query?.data || req.query?.query || '';
  }

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter (query or data)' });
  }

  for (const mirror of MIRRORS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);

      const upstream = await fetch(mirror, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'SwasthyaConnect/1.0 (healthcare@swasthya.org)'
        },
        body: 'data=' + encodeURIComponent(query),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!upstream.ok) continue;

      const data = await upstream.json();
      return res.status(200).json(data);
    } catch (err) {
      // try next mirror
      continue;
    }
  }

  return res.status(502).json({ error: 'All Overpass mirrors failed or timed out' });
}
