import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { networkInterfaces } from 'os';

function getLanAddresses(): string[] {
  const addresses: string[] = [];
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    const entries = nets[name];
    if (!entries) continue;
    for (const entry of entries) {
      if (entry.family === 'IPv4' && !entry.internal) {
        addresses.push(entry.address);
      }
    }
  }
  return addresses;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Encryption helper endpoint / health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // RSS Proxy Endpoint (Bypasses CORS for RSS feeds)
  app.get('/api/proxy', async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
      const decodedUrl = decodeURIComponent(targetUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(decodedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BRIO/1.0',
          'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, */*',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return res.status(response.status).send(`HTTP Error ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || 'application/xml';
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.send(buffer);
    } catch (err: any) {
      return res.status(502).json({ error: err.message || 'Proxy request failed' });
    }
  });

  // Weather Proxy Endpoint (Bypasses CORS for weather APIs)
  app.get('/api/weather', async (req, res) => {
    const { ids } = req.query;
    const icao = typeof ids === 'string' ? ids.trim().toUpperCase() : 'KJFK';

    try {
      const noaaRes = await fetch(`https://aviationweather.gov/api/data/metar?ids=${icao}&format=json`, {
        headers: { Accept: 'application/json' },
      });

      if (!noaaRes.ok) {
        return res.status(noaaRes.status).json({ error: `NOAA returned ${noaaRes.status}` });
      }

      const data = await noaaRes.json();
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.json(data);
    } catch (err: any) {
      return res.status(502).json({ error: err.message || 'Weather proxy failed' });
    }
  });

  // Favicon handler to prevent 404 spam
  app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
  }

  app.get('*', (req, res) => {
    const htmlPath = process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), 'dist', 'index.html')
      : path.join(process.cwd(), 'index.html');
    res.sendFile(htmlPath);
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    const lanAddresses = getLanAddresses();
    console.log(`Server listening on http://localhost:${PORT}`);
    for (const addr of lanAddresses) {
      console.log(`Server listening on http://${addr}:${PORT}`);
    }
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });
}

startServer();
