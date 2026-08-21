import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { networkInterfaces } from 'os';
import crypto from 'crypto';

// Encryption Configuration
const ENCRYPTION_KEY = crypto.randomBytes(32); // 256-bit key
const IV_LENGTH = 16; // AES block size

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function getLanAddresses(): string[] {
  const addresses: string[] = [];
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    const entries = nets[name];
    if (!entries) continue;
    for (const entry of entries) {
      // Include IPv4 addresses, excluding internal (loopback)
      if (entry.family === 'IPv4' && !entry.internal) {
        addresses.push(entry.address);
      }
      // Also include IPv6 non-link-local for better mobile compatibility
      if (entry.family === 'IPv6' && !entry.internal && !entry.address.startsWith('fe80')) {
        addresses.push(`[${entry.address}]`);
      }
    }
  }
  return addresses;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = '0.0.0.0'; // Listen on all interfaces

  // Middleware to parse JSON and handle CORS
  app.use(express.json());
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Encryption helper endpoint
  app.get('/api/encrypt', (req, res) => {
    const { data } = req.query;
    if (!data || typeof data !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid data parameter' });
    }
    try {
      const encrypted = encrypt(data);
      res.json({ encrypted });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Encryption failed' });
    }
  });

  app.get('/api/decrypt', (req, res) => {
    const { data } = req.query;
    if (!data || typeof data !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid data parameter' });
    }
    try {
      const decrypted = decrypt(data);
      res.json({ decrypted });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Decryption failed' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: Date.now(),
      encryption: 'enabled',
      protocol: 'http'
    });
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
      server: { 
        middlewareMode: true,
        host: HOST,
        port: Number(PORT)
      },
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

  const server = app.listen(PORT, HOST, () => {
    const lanAddresses = getLanAddresses();
    console.log(`\n🚀 Brio Server Started`);
    console.log(`✅ Local:   http://localhost:${PORT}`);
    console.log(`✅ Network: Available on following addresses:`);
    
    if (lanAddresses.length === 0) {
      console.log(`   (No LAN addresses detected)`);
    }
    
    for (const addr of lanAddresses) {
      console.log(`   📱 http://${addr}:${PORT}`);
    }
    
    console.log(`\n💡 Tip: On mobile, use one of the Network addresses above.`);
    console.log(`🔒 Encryption enabled (AES-256-CBC)\n`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
      console.error(`   Try: npx tsx server.ts --port 3001`);
    } else {
      console.error('❌ Server error:', err);
    }
    process.exit(1);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}

startServer();
