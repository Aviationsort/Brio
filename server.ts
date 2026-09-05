import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  initDb,
  createUser,
  getUserByUsername,
  isLocked,
  recordLoginFailure,
  resetLoginFailures,
  createSession,
  getSession,
  deleteSession,
  getVault,
  putVault,
  pingDb,
  integrityCheck,
  getActiveConnectionCount,
} from './server/db';
import {
  ApiError,
  requestIdMiddleware,
  errorHandler,
  asyncHandler,
  toPublicError,
} from './server/errors';
import {
  hashPassword,
  verifyPassword,
  aesEncrypt,
  aesDecrypt,
} from './server/crypto';
import { loginRateLimit, signupRateLimit } from './server/rateLimit';
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

// Extract a Bearer token from the Authorization header.
function extractToken(req: express.Request): string | null {
  const auth = req.headers['authorization'];
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim() || null;
  }
  return null;
}

// Mint a session: encrypt the session payload with AES-256-GCM and persist the
// session row inside the replicated SQLite store for low-latency node reads.
function issueSession(username: string, req: express.Request): string {
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
  const payload = JSON.stringify({ id, username, exp: expiresAt.getTime() });
  const token = aesEncrypt(payload);
  createSession(id, username, expiresAt, req.ip || 'unknown').catch((err) => {
    console.error('[session] failed to persist:', (err as Error).message);
  });
  return token;
}

// Resolve a Bearer token to its session: decrypt (AES-256-GCM) and look up the
// row in the replicated SQLite store. Throws a sanitized 401 on any failure.
async function resolveSession(token: string): Promise<{ username: string }> {
  let payload: { id: string; username: string; exp: number };
  try {
    payload = JSON.parse(aesDecrypt(token));
  } catch {
    throw new ApiError(401, 'INVALID_SESSION', 'Session expired or invalid.');
  }
  const session = await getSession(payload.id);
  if (!session) throw new ApiError(401, 'INVALID_SESSION', 'Session expired or invalid.');
  return { username: session.username };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = '0.0.0.0'; // Listen on all interfaces

  // Middleware to parse JSON and handle CORS
  // Raise the body limit so large AES-256 encrypted vault payloads don't fail.
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Trust the proxy layer (Fly/LiteFS) so req.ip reflects the real client for
  // rate-limiting and audit logging instead of the internal proxy IP.
  app.set('trust proxy', true);

  // Attach a correlation id to every request for structured error debugging.
  app.use(requestIdMiddleware);

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

  // Weather Proxy Endpoint — server-side fetch from OpenWeatherMap (keeps the
  // API key server-side and avoids CORS). Returns the upstream JSON as-is.
  app.get(
    '/api/weather',
    asyncHandler(async (req, res) => {
      const city =
        typeof req.query.q === 'string' && req.query.q.trim().length > 0
          ? req.query.q.trim()
          : 'London';
      const units = req.query.units === 'imperial' ? 'imperial' : 'metric';

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=4cec456a12e78e190dc12413b1d46585&units=${units}`;

      try {
        const owm = await fetch(url);
        const data = await owm.json();
        if (!owm.ok) {
          return res.status(owm.status).json({ error: (data && data.message) || 'Weather request failed' });
        }
        return res.json(data);
      } catch (err) {
        throw new ApiError(502, 'WEATHER_UNAVAILABLE', 'Weather service is temporarily unavailable.');
      }
    })
  );

  // ---------- Auth & Vault (SQLite-backed, LiteFS-ready) ----------

  // Database layer health check
  app.get('/api/db-status', asyncHandler(async (_req, res) => {
    const ok = await pingDb();
    if (!ok) throw new ApiError(503, 'DB_UNAVAILABLE', 'The database is temporarily unavailable.');
    res.json({ status: 'ok' });
  }));

  // Real-time database telemetry + active corruption diagnostics.
  app.get('/api/v1/health/db', asyncHandler(async (_req, res) => {
    const start = performance.now();
    let status: 'HEALTHY' | 'DEGRADED' | 'CORRUPTED' | 'OFFLINE' = 'HEALTHY';
    let detail = 'all checks passed';
    let connections = 0;
    try {
      const reachable = await pingDb();
      if (!reachable) {
        status = 'OFFLINE';
        detail = 'database unreachable';
      } else {
        const ic = await integrityCheck();
        connections = await getActiveConnectionCount();
        if (!ic.ok) {
          status = ic.issues.length > 0 ? 'CORRUPTED' : 'OFFLINE';
          detail = ic.issues.slice(0, 5).join('; ') || 'integrity check failed';
        } else {
          const latency = performance.now() - start;
          if (latency > 200) {
            status = 'DEGRADED';
            detail = `elevated latency ${latency.toFixed(1)}ms`;
          } else {
            detail = `latency ${latency.toFixed(1)}ms`;
          }
        }
      }
    } catch (err) {
      status = 'OFFLINE';
      detail = 'health check failed';
      console.error('[health/db] diagnostic error:', (err as Error).message);
    }
    const latencyMs = Math.round((performance.now() - start) * 100) / 100;
    res.json({
      status,
      latencyMs,
      engine: 'sqlite',
      journalMode: 'wal',
      fsync: 'on',
      dataChecksums: false, // SQLite has no page checksums; integrity_check is used instead
      connections,
      timestamp: new Date().toISOString(),
      detail,
    });
  }));

  // ---------- Auth: Signup ----------
  app.post(
    '/api/auth/signup',
    signupRateLimit,
    asyncHandler(async (req, res) => {
      const { username, email, password } = req.body || {};

      // Input validation (public messages are friendly, non-revealing).
      if (!username || typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
        throw new ApiError(
          400,
          'INVALID_USERNAME',
          'Username must be 3–32 characters: letters, numbers, and underscores only.'
        );
      }
      if (!password || typeof password !== 'string' || password.length < 8) {
        throw new ApiError(400, 'WEAK_PASSWORD', 'Password must be at least 8 characters.');
      }
      if (email && typeof email === 'string' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        throw new ApiError(400, 'INVALID_EMAIL', 'Please provide a valid email address.');
      }

      const lockedUntil = await isLocked(username);
      if (lockedUntil) {
        const retryAfterSec = Math.ceil((lockedUntil.getTime() - Date.now()) / 1000);
        const err = new ApiError(423, 'ACCOUNT_LOCKED', 'This account is temporarily locked. Try again later.');
        res.setHeader('Retry-After', String(retryAfterSec));
        throw err;
      }

      // Argon2id hashing (zero-knowledge: only the hash is stored).
      const argonHash = await hashPassword(password);
      try {
        await createUser(username, email || '', argonHash);
      } catch (err: any) {
        if (String(err?.message).includes('USER_EXISTS')) {
          throw new ApiError(409, 'USER_EXISTS', 'An account with that username already exists.');
        }
        throw err;
      }

      const token = issueSession(username, req);
      res.status(201).json({
        ok: true,
        token,
        user: { username, email: email || '' },
      });
    })
  );

  // ---------- Auth: Login ----------
  app.post(
    '/api/auth/login',
    loginRateLimit,
    asyncHandler(async (req, res) => {
      const { username, password } = req.body || {};

      if (!username || !password) {
        throw new ApiError(400, 'MISSING_CREDENTIALS', 'Username and password are required.');
      }

      const user = await getUserByUsername(username);
      // Perform a dummy verify even when the user is missing to equalize timing
      // and avoid username enumeration.
      const hashOk = user ? await verifyPassword(password, user.argon_hash) : await verifyPassword(password, '$argon2id$v=19$m=19456,t=3,p=1$AAAAAAAAAAAAAAAAAAAAAA==$0000000000000000000000000000000000000000000000000000000000000000');

      if (!user || !hashOk) {
        if (user) await recordLoginFailure(username);
        throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid username or password.');
      }

      const lockedUntil = await isLocked(username);
      if (lockedUntil) {
        const retryAfterSec = Math.ceil((lockedUntil.getTime() - Date.now()) / 1000);
        res.setHeader('Retry-After', String(retryAfterSec));
        throw new ApiError(423, 'ACCOUNT_LOCKED', 'This account is temporarily locked. Try again later.');
      }

      await resetLoginFailures(username);
      const token = issueSession(username, req);
      res.json({ ok: true, token, user: { username: user.username, email: user.email || '' } });
    })
  );

  // ---------- Auth: Logout ----------
  app.post(
    '/api/auth/logout',
    asyncHandler(async (req, res) => {
      const token = extractToken(req);
      if (token) await deleteSession(token);
      res.json({ ok: true });
    })
  );

  // ---------- Auth: Resume session ----------
  app.get(
    '/api/auth/session',
    asyncHandler(async (req, res) => {
      const token = extractToken(req);
      if (!token) throw new ApiError(401, 'NO_SESSION', 'Not authenticated.');
      const session = await resolveSession(token);
      const user = await getUserByUsername(session.username);
      if (!user) throw new ApiError(401, 'INVALID_SESSION', 'Session expired or invalid.');
      res.json({ ok: true, user: { username: user.username, email: user.email || '' } });
    })
  );

  // ---------- Vault: server-side encrypted envelope (optional cross-device sync) ----------
  app.get('/api/vault/:username', asyncHandler(async (req, res) => {
    const token = extractToken(req);
    if (!token) throw new ApiError(401, 'NO_SESSION', 'Authentication required.');
    const session = await resolveSession(token);
    if (session.username.toLowerCase() !== req.params.username.toLowerCase()) throw new ApiError(403, 'FORBIDDEN', 'Access denied.');
    const encrypted = await getVault(req.params.username);
    // Unseal so the authenticated owner receives their original client-encrypted payload.
    const data = encrypted ? aesDecrypt(encrypted) : null;
    res.json({ data });
  }));

  app.put('/api/vault/:username', asyncHandler(async (req, res) => {
    const token = extractToken(req);
    if (!token) throw new ApiError(401, 'NO_SESSION', 'Authentication required.');
    const session = await resolveSession(token);
    if (session.username.toLowerCase() !== req.params.username.toLowerCase()) throw new ApiError(403, 'FORBIDDEN', 'Access denied.');
    const { data } = req.body || {};
    if (typeof data !== 'string') throw new ApiError(400, 'INVALID_PAYLOAD', 'Invalid vault payload.');
    // Re-seal at rest with AES-256-GCM so the stored blob is never plaintext.
    const sealed = aesEncrypt(data);
    await putVault(req.params.username, sealed);
    res.json({ ok: true });
  }));

  // Favicon handler to prevent 404 spam
  app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
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

  // Global error handler — must be registered after all routes.
  app.use(errorHandler);

  // Initialize the SQLite auth store (LiteFS replicates the .db file globally).
  await initDb();

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
