import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function overpassDevProxyPlugin(): Plugin {
  return {
    name: 'overpass-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/overpass', async (req, res) => {
        // Handle CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          let query = '';
          try {
            const parsed = JSON.parse(body);
            query = parsed.query || body;
          } catch {
            query = body;
          }

          if (!query && req.url) {
            const u = new URL(req.url, 'http://localhost');
            query = u.searchParams.get('data') || u.searchParams.get('query') || '';
          }

          if (!query) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing query' }));
            return;
          }

          const mirrors = [
            'https://lz4.overpass-api.de/api/interpreter',
            'https://overpass-api.de/api/interpreter',
            'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
            'https://z.overpass-api.de/api/interpreter',
          ];

          for (const mirror of mirrors) {
            try {
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 12000);
              const upstream = await fetch(mirror, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                  'User-Agent': 'SwasthyaConnect/1.0 (healthcare@swasthya.org)',
                },
                body: 'data=' + encodeURIComponent(query),
                signal: controller.signal,
              });
              clearTimeout(timer);

              if (upstream.ok) {
                const data = await upstream.text();
                res.setHeader('Content-Type', 'application/json');
                res.end(data);
                return;
              }
            } catch {
              continue;
            }
          }

          res.statusCode = 502;
          res.end(JSON.stringify({ error: 'All Overpass mirrors failed' }));
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    overpassDevProxyPlugin(),
  ],
});
