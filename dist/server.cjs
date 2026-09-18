var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_vite = require("vite");

// server/db.ts
var import_node_sqlite = require("node:sqlite");
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var DATA_DIR = process.env.LITEFS_DIR ? import_path.default.join(process.env.LITEFS_DIR, "data") : import_path.default.join(process.cwd(), "data");
var DB_PATH = process.env.SQLITE_PATH || import_path.default.join(DATA_DIR, "storage.db");
var MAX_FAILED_ATTEMPTS = 5;
var LOCK_DURATION_MS = 15 * 60 * 1e3;
var db = null;
var usingFallback = false;
var memUsers = /* @__PURE__ */ new Map();
var memSessions = /* @__PURE__ */ new Map();
var memVaults = /* @__PURE__ */ new Map();
function ensureDir() {
  import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
}
function migrate() {
  if (!db) return;
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT,
      argon_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      failed_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TEXT
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      ip TEXT
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS vaults (
      username TEXT PRIMARY KEY,
      data TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
function getDb() {
  if (usingFallback) return null;
  if (!db) {
    try {
      ensureDir();
      db = new import_node_sqlite.DatabaseSync(DB_PATH);
      db.exec("PRAGMA journal_mode = WAL;");
      db.exec("PRAGMA synchronous = FULL;");
      db.exec("PRAGMA busy_timeout = 5000;");
      db.exec("PRAGMA foreign_keys = ON;");
      db.exec("PRAGMA integrity_check;");
      migrate();
    } catch (err) {
      console.error("\u26A0\uFE0F SQLite unavailable, using in-memory store:", err.message);
      usingFallback = true;
      db = null;
      return null;
    }
  }
  return db;
}
async function initDb() {
  try {
    const d = getDb();
    if (d) {
      console.log("\u2705 SQLite database initialized at", DB_PATH);
    } else {
      console.log("\u2139\uFE0F Using in-memory auth store (SQLite unavailable).");
    }
    return true;
  } catch (err) {
    console.error("\u26A0\uFE0F Auth store init issue:", err.message);
    return true;
  }
}
function inTx(fn) {
  const d = getDb();
  if (!d) return fn(d);
  d.exec("BEGIN IMMEDIATE");
  try {
    const result = fn(d);
    d.exec("COMMIT");
    return result;
  } catch (err) {
    try {
      d.exec("ROLLBACK");
    } catch {
    }
    throw err;
  }
}
async function createUser(username, email, argonHash) {
  if (usingFallback) {
    if (memUsers.has(username.toLowerCase())) {
      throw new Error("USER_EXISTS");
    }
    memUsers.set(username.toLowerCase(), {
      id: memUsers.size + 1,
      username,
      email: email || null,
      argon_hash: argonHash,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      failed_attempts: 0,
      locked_until: null
    });
    return;
  }
  try {
    inTx((d) => {
      d.prepare(
        "INSERT INTO users (username, email, argon_hash) VALUES (?, ?, ?)"
      ).run(username, email || null, argonHash);
    });
  } catch (err) {
    if (String(err?.message || "").includes("UNIQUE")) {
      throw new Error("USER_EXISTS");
    }
    throw err;
  }
}
async function getUserByUsername(username) {
  if (usingFallback) {
    return memUsers.get(username.toLowerCase()) || null;
  }
  const d = getDb();
  if (!d) return null;
  const row = d.prepare("SELECT * FROM users WHERE username = ?").get(username);
  return row || null;
}
async function isLocked(username) {
  const user = await getUserByUsername(username);
  if (!user || !user.locked_until) return null;
  const until = new Date(user.locked_until);
  return until.getTime() > Date.now() ? until : null;
}
async function recordLoginFailure(username) {
  if (usingFallback) {
    const u = memUsers.get(username.toLowerCase());
    if (!u) return;
    u.failed_attempts += 1;
    if (u.failed_attempts >= MAX_FAILED_ATTEMPTS) {
      u.locked_until = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
    }
    return;
  }
  const d = getDb();
  if (!d) return;
  inTx((db2) => {
    db2.prepare(
      `UPDATE users SET failed_attempts = failed_attempts + 1,
       locked_until = CASE WHEN failed_attempts + 1 >= ? THEN ? ELSE locked_until END
       WHERE username = ?`
    ).run(MAX_FAILED_ATTEMPTS, new Date(Date.now() + LOCK_DURATION_MS).toISOString(), username);
  });
}
async function resetLoginFailures(username) {
  if (usingFallback) {
    const u = memUsers.get(username.toLowerCase());
    if (u) {
      u.failed_attempts = 0;
      u.locked_until = null;
    }
    return;
  }
  const d = getDb();
  if (!d) return;
  inTx((db2) => {
    db2.prepare("UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE username = ?").run(username);
  });
}
async function createSession(id, username, expiresAt, ip) {
  if (usingFallback) {
    memSessions.set(id, {
      username,
      expires_at: expiresAt.toISOString(),
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      ip
    });
    return;
  }
  const d = getDb();
  if (!d) return;
  inTx((db2) => {
    db2.prepare(
      "INSERT INTO sessions (id, username, expires_at, ip) VALUES (?, ?, ?, ?)"
    ).run(id, username, expiresAt.toISOString(), ip);
  });
}
async function getSession(id) {
  if (usingFallback) {
    const s = memSessions.get(id);
    if (!s) return null;
    const exp2 = new Date(s.expires_at);
    if (exp2.getTime() <= Date.now()) {
      memSessions.delete(id);
      return null;
    }
    return { username: s.username, expiresAt: exp2 };
  }
  const d = getDb();
  if (!d) return null;
  const row = d.prepare("SELECT username, expires_at FROM sessions WHERE id = ?").get(id);
  if (!row) return null;
  const exp = new Date(row.expires_at);
  if (exp.getTime() <= Date.now()) {
    d.prepare("DELETE FROM sessions WHERE id = ?").run(id);
    return null;
  }
  return { username: row.username, expiresAt: exp };
}
async function deleteSession(id) {
  if (usingFallback) {
    memSessions.delete(id);
    return;
  }
  const d = getDb();
  if (!d) return;
  inTx((db2) => {
    db2.prepare("DELETE FROM sessions WHERE id = ?").run(id);
  });
}
async function getVault(username) {
  const key = username.toLowerCase();
  if (usingFallback) return memVaults.get(key) || null;
  const d = getDb();
  if (!d) return null;
  const row = d.prepare("SELECT data FROM vaults WHERE LOWER(username) = ?").get(key);
  return row?.data || null;
}
async function putVault(username, data) {
  const key = username.toLowerCase();
  if (usingFallback) {
    memVaults.set(key, data);
    return;
  }
  const d = getDb();
  if (!d) return;
  inTx((db2) => {
    db2.prepare(
      "INSERT INTO vaults (username, data) VALUES (?, ?) ON CONFLICT(username) DO UPDATE SET data = excluded.data, updated_at = datetime('now')"
    ).run(key, data);
  });
}
async function pingDb() {
  if (usingFallback) return true;
  const d = getDb();
  if (!d) return false;
  try {
    d.prepare("SELECT 1").get();
    return true;
  } catch {
    return false;
  }
}
async function integrityCheck() {
  if (usingFallback) return { ok: true, issues: [] };
  const d = getDb();
  if (!d) return { ok: false, issues: ["database unavailable"] };
  try {
    const rows = d.prepare("PRAGMA integrity_check").all();
    const issues = rows.filter((r) => r.integrity_check !== "ok").map((r) => r.integrity_check);
    if (issues.length > 0) return { ok: false, issues };
    const fk = d.prepare("PRAGMA foreign_key_check").all();
    if (fk.length > 0) return { ok: false, issues: fk.map((r) => JSON.stringify(r)) };
    return { ok: true, issues: [] };
  } catch (err) {
    return { ok: false, issues: [err.message] };
  }
}
async function getActiveConnectionCount() {
  if (usingFallback) return memSessions.size;
  const d = getDb();
  if (!d) return 0;
  try {
    const row = d.prepare("SELECT count(*) AS c FROM sessions WHERE expires_at > ?").get((/* @__PURE__ */ new Date()).toISOString());
    return row.c;
  } catch {
    return 0;
  }
}

// server/errors.ts
var import_crypto = __toESM(require("crypto"), 1);
var ApiError = class extends Error {
  constructor(status, code, publicMessage, internal) {
    super(publicMessage);
    this.status = status;
    this.code = code;
    this.publicMessage = publicMessage;
    this.internal = internal;
  }
};
var GENERIC_MESSAGE = "An unexpected error occurred. Please try again later.";
function requestIdMiddleware(req, _res, next) {
  req.requestId = import_crypto.default.randomUUID();
  next();
}
function errorHandler(err, req, res, _next) {
  const requestId = req.requestId || import_crypto.default.randomUUID();
  if (err instanceof ApiError) {
    console.error(
      `[API ${err.status}] code=${err.code} requestId=${requestId} ip=${req.ip} path=${req.path} :: ${String(
        err.internal ?? err.message
      )}`
    );
    res.status(err.status).json({
      error: { code: err.code, message: err.publicMessage, requestId }
    });
    return;
  }
  const detail = err instanceof Error ? `${err.message}
${err.stack || ""}` : String(err);
  console.error(`[API 500] requestId=${requestId} ip=${req.ip} path=${req.path} :: ${detail}`);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: GENERIC_MESSAGE, requestId }
  });
  return;
}
function asyncHandler(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

// server/crypto.ts
var import_crypto2 = __toESM(require("crypto"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_hash_wasm = require("hash-wasm");
var ARGON2_PARAMS = {
  memorySize: 19456,
  // KiB (~19 MiB)
  iterations: 3,
  parallelism: 1,
  hashLength: 32
};
var DATA_DIR2 = process.env.LITEFS_DIR ? import_path2.default.join(process.env.LITEFS_DIR, "data") : import_path2.default.join(process.cwd(), "data");
var AES_KEY_PATH = process.env.LITEFS_DIR ? import_path2.default.join(process.env.LITEFS_DIR, "aes-master.key") : import_path2.default.join(DATA_DIR2, "aes-master.key");
function ensureDir2() {
  import_fs2.default.mkdirSync(DATA_DIR2, { recursive: true });
}
async function hashPassword(password) {
  const salt = import_crypto2.default.randomBytes(16);
  const hash = await (0, import_hash_wasm.argon2id)({
    password,
    salt,
    parallelism: ARGON2_PARAMS.parallelism,
    iterations: ARGON2_PARAMS.iterations,
    memorySize: ARGON2_PARAMS.memorySize,
    hashLength: ARGON2_PARAMS.hashLength,
    outputType: "hex"
  });
  const saltB64 = salt.toString("base64");
  return `$argon2id$v=19$m=${ARGON2_PARAMS.memorySize},t=${ARGON2_PARAMS.iterations},p=${ARGON2_PARAMS.parallelism}$${saltB64}$${hash}`;
}
async function verifyPassword(password, stored) {
  try {
    const parts = stored.split("$");
    if (parts.length !== 6 || parts[1] !== "argon2id") return false;
    const paramStr = parts[3];
    const saltB64 = parts[4];
    const expectedHash = parts[5];
    const getParam = (key) => {
      const m = paramStr.match(new RegExp(`${key}=(\\d+)`));
      return m ? parseInt(m[1], 10) : 0;
    };
    const candidate = await (0, import_hash_wasm.argon2id)({
      password,
      salt: Buffer.from(saltB64, "base64"),
      parallelism: getParam("p"),
      iterations: getParam("t"),
      memorySize: getParam("m"),
      hashLength: ARGON2_PARAMS.hashLength,
      outputType: "hex"
    });
    const a = Buffer.from(candidate, "hex");
    const b = Buffer.from(expectedHash, "hex");
    if (a.length !== b.length) return false;
    return import_crypto2.default.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
var cachedKey = null;
function getAesKey() {
  if (cachedKey) return cachedKey;
  if (process.env.AES_MASTER_KEY) {
    cachedKey = Buffer.from(process.env.AES_MASTER_KEY, "hex");
    if (cachedKey.length !== 32) {
      throw new Error("AES_MASTER_KEY must be a 32-byte (64 hex char) key.");
    }
    return cachedKey;
  }
  try {
    if (import_fs2.default.existsSync(AES_KEY_PATH)) {
      cachedKey = import_fs2.default.readFileSync(AES_KEY_PATH);
      if (cachedKey.length === 32) return cachedKey;
    }
  } catch {
  }
  ensureDir2();
  cachedKey = import_crypto2.default.randomBytes(32);
  try {
    import_fs2.default.writeFileSync(AES_KEY_PATH, cachedKey, { mode: 384 });
  } catch (err) {
    console.error("\u26A0\uFE0F Could not persist AES master key:", err.message);
  }
  return cachedKey;
}
function aesEncrypt(plaintext) {
  const key = getAesKey();
  const iv = import_crypto2.default.randomBytes(12);
  const cipher = import_crypto2.default.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}
function aesDecrypt(payload) {
  const key = getAesKey();
  const buf = Buffer.from(payload, "base64");
  if (buf.length < 28) throw new Error("Malformed ciphertext");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = import_crypto2.default.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

// server/rateLimit.ts
var buckets = /* @__PURE__ */ new Map();
function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) {
    return fwd.split(",")[0].trim();
  }
  return req.ip || "unknown";
}
function rateLimit(options) {
  const { windowMs, max, keyPrefix, message } = options;
  return (req, res, next) => {
    const ip = getClientIp(req);
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    const remaining = Math.max(0, max - bucket.count);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    if (bucket.count > max) {
      const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1e3);
      res.setHeader("Retry-After", String(retryAfterSec));
      return next(
        new ApiError(429, "RATE_LIMITED", message, {
          ip,
          keyPrefix,
          retryAfterSec
        })
      );
    }
    next();
  };
}
var loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 10,
  // 10 login attempts per IP / 15 min
  keyPrefix: "login",
  message: "Too many login attempts. Please wait a few minutes and try again."
});
var signupRateLimit = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  max: 5,
  // 5 account creations per IP / hour
  keyPrefix: "signup",
  message: "Account creation is temporarily limited. Please try again later."
});

// server.ts
var import_os = require("os");
var import_crypto4 = __toESM(require("crypto"), 1);
var ENCRYPTION_KEY = import_crypto4.default.randomBytes(32);
var IV_LENGTH = 16;
function encrypt(text) {
  const iv = import_crypto4.default.randomBytes(IV_LENGTH);
  const cipher = import_crypto4.default.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}
function decrypt(text) {
  const parts = text.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = parts[1];
  const decipher = import_crypto4.default.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
function getLanAddresses() {
  const addresses = [];
  const nets = (0, import_os.networkInterfaces)();
  for (const name of Object.keys(nets)) {
    const entries = nets[name];
    if (!entries) continue;
    for (const entry of entries) {
      if (entry.family === "IPv4" && !entry.internal) {
        addresses.push(entry.address);
      }
      if (entry.family === "IPv6" && !entry.internal && !entry.address.startsWith("fe80")) {
        addresses.push(`[${entry.address}]`);
      }
    }
  }
  return addresses;
}
function extractToken(req) {
  const auth = req.headers["authorization"];
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    return auth.slice(7).trim() || null;
  }
  return null;
}
function issueSession(username, req) {
  const id = import_crypto4.default.randomUUID();
  const expiresAt = new Date(Date.now() + 1e3 * 60 * 60 * 24 * 30);
  const payload = JSON.stringify({ id, username, exp: expiresAt.getTime() });
  const token = aesEncrypt(payload);
  createSession(id, username, expiresAt, req.ip || "unknown").catch((err) => {
    console.error("[session] failed to persist:", err.message);
  });
  return token;
}
async function resolveSession(token) {
  let payload;
  try {
    payload = JSON.parse(aesDecrypt(token));
  } catch {
    throw new ApiError(401, "INVALID_SESSION", "Session expired or invalid.");
  }
  const session = await getSession(payload.id);
  if (!session) throw new ApiError(401, "INVALID_SESSION", "Session expired or invalid.");
  return { username: session.username };
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = Number(process.env.PORT) || 3e3;
  const HOST = "0.0.0.0";
  app.use(import_express.default.json({ limit: "100mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "100mb" }));
  app.set("trust proxy", true);
  app.use(requestIdMiddleware);
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  app.get("/api/encrypt", (req, res) => {
    const { data } = req.query;
    if (!data || typeof data !== "string") {
      return res.status(400).json({ error: "Missing or invalid data parameter" });
    }
    try {
      const encrypted = encrypt(data);
      res.json({ encrypted });
    } catch (err) {
      res.status(500).json({ error: err.message || "Encryption failed" });
    }
  });
  app.get("/api/decrypt", (req, res) => {
    const { data } = req.query;
    if (!data || typeof data !== "string") {
      return res.status(400).json({ error: "Missing or invalid data parameter" });
    }
    try {
      const decrypted = decrypt(data);
      res.json({ decrypted });
    } catch (err) {
      res.status(500).json({ error: err.message || "Decryption failed" });
    }
  });
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: Date.now(),
      encryption: "enabled",
      protocol: "http"
    });
  });
  app.get("/api/proxy", async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }
    try {
      const decodedUrl = decodeURIComponent(targetUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15e3);
      const response = await fetch(decodedUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BRIO/1.0",
          "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, */*"
        }
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        return res.status(response.status).send(`HTTP Error ${response.status}`);
      }
      const contentType = response.headers.get("content-type") || "application/xml";
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.setHeader("Content-Type", contentType);
      return res.send(buffer);
    } catch (err) {
      return res.status(502).json({ error: err.message || "Proxy request failed" });
    }
  });
  app.get(
    "/api/weather",
    asyncHandler(async (req, res) => {
      const city = typeof req.query.q === "string" && req.query.q.trim().length > 0 ? req.query.q.trim() : "London";
      const units = req.query.units === "imperial" ? "imperial" : "metric";
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=4cec456a12e78e190dc12413b1d46585&units=${units}`;
      try {
        const owm = await fetch(url);
        const data = await owm.json();
        if (!owm.ok) {
          return res.status(owm.status).json({ error: data && data.message || "Weather request failed" });
        }
        return res.json(data);
      } catch (err) {
        throw new ApiError(502, "WEATHER_UNAVAILABLE", "Weather service is temporarily unavailable.");
      }
    })
  );
  app.get("/api/db-status", asyncHandler(async (_req, res) => {
    const ok = await pingDb();
    if (!ok) throw new ApiError(503, "DB_UNAVAILABLE", "The database is temporarily unavailable.");
    res.json({ status: "ok" });
  }));
  app.get("/api/v1/health/db", asyncHandler(async (_req, res) => {
    const start = performance.now();
    let status = "HEALTHY";
    let detail = "all checks passed";
    let connections = 0;
    try {
      const reachable = await pingDb();
      if (!reachable) {
        status = "OFFLINE";
        detail = "database unreachable";
      } else {
        const ic = await integrityCheck();
        connections = await getActiveConnectionCount();
        if (!ic.ok) {
          status = ic.issues.length > 0 ? "CORRUPTED" : "OFFLINE";
          detail = ic.issues.slice(0, 5).join("; ") || "integrity check failed";
        } else {
          const latency = performance.now() - start;
          if (latency > 200) {
            status = "DEGRADED";
            detail = `elevated latency ${latency.toFixed(1)}ms`;
          } else {
            detail = `latency ${latency.toFixed(1)}ms`;
          }
        }
      }
    } catch (err) {
      status = "OFFLINE";
      detail = "health check failed";
      console.error("[health/db] diagnostic error:", err.message);
    }
    const latencyMs = Math.round((performance.now() - start) * 100) / 100;
    res.json({
      status,
      latencyMs,
      engine: "sqlite",
      journalMode: "wal",
      fsync: "on",
      dataChecksums: false,
      // SQLite has no page checksums; integrity_check is used instead
      connections,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      detail
    });
  }));
  app.post(
    "/api/auth/signup",
    signupRateLimit,
    asyncHandler(async (req, res) => {
      const { username, email, password } = req.body || {};
      if (!username || typeof username !== "string" || !/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
        throw new ApiError(
          400,
          "INVALID_USERNAME",
          "Username must be 3\u201332 characters: letters, numbers, and underscores only."
        );
      }
      if (!password || typeof password !== "string" || password.length < 8) {
        throw new ApiError(400, "WEAK_PASSWORD", "Password must be at least 8 characters.");
      }
      if (email && typeof email === "string" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        throw new ApiError(400, "INVALID_EMAIL", "Please provide a valid email address.");
      }
      const lockedUntil = await isLocked(username);
      if (lockedUntil) {
        const retryAfterSec = Math.ceil((lockedUntil.getTime() - Date.now()) / 1e3);
        const err = new ApiError(423, "ACCOUNT_LOCKED", "This account is temporarily locked. Try again later.");
        res.setHeader("Retry-After", String(retryAfterSec));
        throw err;
      }
      const argonHash = await hashPassword(password);
      try {
        await createUser(username, email || "", argonHash);
      } catch (err) {
        if (String(err?.message).includes("USER_EXISTS")) {
          throw new ApiError(409, "USER_EXISTS", "An account with that username already exists.");
        }
        throw err;
      }
      const token = issueSession(username, req);
      res.status(201).json({
        ok: true,
        token,
        user: { username, email: email || "" }
      });
    })
  );
  app.post(
    "/api/auth/login",
    loginRateLimit,
    asyncHandler(async (req, res) => {
      const { username, password } = req.body || {};
      if (!username || !password) {
        throw new ApiError(400, "MISSING_CREDENTIALS", "Username and password are required.");
      }
      const user = await getUserByUsername(username);
      const hashOk = user ? await verifyPassword(password, user.argon_hash) : await verifyPassword(password, "$argon2id$v=19$m=19456,t=3,p=1$AAAAAAAAAAAAAAAAAAAAAA==$0000000000000000000000000000000000000000000000000000000000000000");
      if (!user || !hashOk) {
        if (user) await recordLoginFailure(username);
        throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid username or password.");
      }
      const lockedUntil = await isLocked(username);
      if (lockedUntil) {
        const retryAfterSec = Math.ceil((lockedUntil.getTime() - Date.now()) / 1e3);
        res.setHeader("Retry-After", String(retryAfterSec));
        throw new ApiError(423, "ACCOUNT_LOCKED", "This account is temporarily locked. Try again later.");
      }
      await resetLoginFailures(username);
      const token = issueSession(username, req);
      res.json({ ok: true, token, user: { username: user.username, email: user.email || "" } });
    })
  );
  app.post(
    "/api/auth/logout",
    asyncHandler(async (req, res) => {
      const token = extractToken(req);
      if (token) await deleteSession(token);
      res.json({ ok: true });
    })
  );
  app.get(
    "/api/auth/session",
    asyncHandler(async (req, res) => {
      const token = extractToken(req);
      if (!token) throw new ApiError(401, "NO_SESSION", "Not authenticated.");
      const session = await resolveSession(token);
      const user = await getUserByUsername(session.username);
      if (!user) throw new ApiError(401, "INVALID_SESSION", "Session expired or invalid.");
      res.json({ ok: true, user: { username: user.username, email: user.email || "" } });
    })
  );
  app.get("/api/vault/:username", asyncHandler(async (req, res) => {
    const token = extractToken(req);
    if (!token) throw new ApiError(401, "NO_SESSION", "Authentication required.");
    const session = await resolveSession(token);
    if (session.username.toLowerCase() !== req.params.username.toLowerCase()) throw new ApiError(403, "FORBIDDEN", "Access denied.");
    const encrypted = await getVault(req.params.username);
    const data = encrypted ? aesDecrypt(encrypted) : null;
    res.json({ data });
  }));
  app.put("/api/vault/:username", asyncHandler(async (req, res) => {
    const token = extractToken(req);
    if (!token) throw new ApiError(401, "NO_SESSION", "Authentication required.");
    const session = await resolveSession(token);
    if (session.username.toLowerCase() !== req.params.username.toLowerCase()) throw new ApiError(403, "FORBIDDEN", "Access denied.");
    const { data } = req.body || {};
    if (typeof data !== "string") throw new ApiError(400, "INVALID_PAYLOAD", "Invalid vault payload.");
    const sealed = aesEncrypt(data);
    await putVault(req.params.username, sealed);
    res.json({ ok: true });
  }));
  app.get("/favicon.ico", (req, res) => {
    res.status(204).end();
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: {
        middlewareMode: true
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path3.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
  }
  app.get("*", (req, res) => {
    const htmlPath = process.env.NODE_ENV === "production" ? import_path3.default.join(process.cwd(), "dist", "index.html") : import_path3.default.join(process.cwd(), "index.html");
    res.sendFile(htmlPath);
  });
  app.use(errorHandler);
  await initDb();
  const server = app.listen(PORT, HOST, () => {
    const lanAddresses = getLanAddresses();
    console.log(`
\u{1F680} Brio Server Started`);
    console.log(`\u2705 Local:   http://localhost:${PORT}`);
    console.log(`\u2705 Network: Available on following addresses:`);
    if (lanAddresses.length === 0) {
      console.log(`   (No LAN addresses detected)`);
    }
    for (const addr of lanAddresses) {
      console.log(`   \u{1F4F1} http://${addr}:${PORT}`);
    }
    console.log(`
\u{1F4A1} Tip: On mobile, use one of the Network addresses above.`);
    console.log(`\u{1F512} Encryption enabled (AES-256-CBC)
`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\u274C Port ${PORT} is already in use.`);
      console.error(`   Try: npx tsx server.ts --port 3001`);
    } else {
      console.error("\u274C Server error:", err);
    }
    process.exit(1);
  });
  process.on("SIGTERM", () => {
    console.log("\n\u{1F44B} Shutting down gracefully...");
    server.close(() => {
      console.log("\u2705 Server closed");
      process.exit(0);
    });
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
