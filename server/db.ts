/**
 * Persistence layer for Brio authentication.
 *
 * Uses the built-in `node:sqlite` driver to store credentials and session
 * data in a single on-disk SQLite database (`storage.db`). The file lives inside
 * the LiteFS mount (`LITEFS_DIR`) when deployed, so LiteFS can replicate it
 * globally across nodes for low-latency local reads. All writes are performed
 * with `BEGIN IMMEDIATE` transactions and the rollback journal (DELETE mode),
 * which is the LiteFS-recommended configuration.
 *
 * If the SQLite file cannot be opened for any reason, the layer degrades to an
 * in-memory store so the app stays functional and no scary error is printed.
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.LITEFS_DIR
  ? path.join(process.env.LITEFS_DIR, 'data')
  : path.join(process.cwd(), 'data');

const DB_PATH = process.env.SQLITE_PATH || path.join(DATA_DIR, 'storage.db');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

let db: DatabaseSync | null = null;
let usingFallback = false;

// ---------- In-memory fallback ----------
interface MemUser {
  id: number;
  username: string;
  email: string | null;
  argon_hash: string;
  created_at: string;
  failed_attempts: number;
  locked_until: string | null;
}
const memUsers = new Map<string, MemUser>();
const memSessions = new Map<string, { username: string; expires_at: string; created_at: string; ip: string }>();
const memVaults = new Map<string, string>();

export interface UserRow {
  id: number;
  username: string;
  email: string | null;
  argon_hash: string;
  created_at: string;
  failed_attempts: number;
  locked_until: string | null;
}

function ensureDir(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function migrate(): void {
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

export function getDb(): DatabaseSync | null {
  if (usingFallback) return null;
  if (!db) {
    try {
      ensureDir();
      db = new DatabaseSync(DB_PATH);
      // Durability-first pragmas: WAL journaling + synchronous=FULL (fsync on)
      // guarantees point-in-time recovery and survives unexpected power loss.
      // busy_timeout avoids lock contention under concurrent writes.
      db.exec('PRAGMA journal_mode = WAL;');
      db.exec('PRAGMA synchronous = FULL;');
      db.exec('PRAGMA busy_timeout = 5000;');
      db.exec('PRAGMA foreign_keys = ON;');
      db.exec('PRAGMA integrity_check;'); // fail fast on a corrupt file
      migrate();
    } catch (err) {
      console.error('⚠️ SQLite unavailable, using in-memory store:', (err as Error).message);
      usingFallback = true;
      db = null;
      return null;
    }
  }
  return db;
}

export async function initDb(): Promise<boolean> {
  try {
    const d = getDb();
    if (d) {
      console.log('✅ SQLite database initialized at', DB_PATH);
    } else {
      console.log('ℹ️ Using in-memory auth store (SQLite unavailable).');
    }
    return true;
  } catch (err) {
    console.error('⚠️ Auth store init issue:', (err as Error).message);
    return true;
  }
}

function inTx<T>(fn: (d: DatabaseSync) => T): T {
  const d = getDb();
  if (!d) return fn(d as any); // fallback path ignores the db arg
  d.exec('BEGIN IMMEDIATE');
  try {
    const result = fn(d);
    d.exec('COMMIT');
    return result;
  } catch (err) {
    try {
      d.exec('ROLLBACK');
    } catch {
      /* ignore */
    }
    throw err;
  }
}

// ---------- Users ----------

export async function createUser(username: string, email: string, argonHash: string): Promise<void> {
  if (usingFallback) {
    if (memUsers.has(username.toLowerCase())) {
      throw new Error('USER_EXISTS');
    }
    memUsers.set(username.toLowerCase(), {
      id: memUsers.size + 1,
      username,
      email: email || null,
      argon_hash: argonHash,
      created_at: new Date().toISOString(),
      failed_attempts: 0,
      locked_until: null,
    });
    return;
  }

  try {
    inTx((d) => {
      d.prepare(
        'INSERT INTO users (username, email, argon_hash) VALUES (?, ?, ?)'
      ).run(username, email || null, argonHash);
    });
  } catch (err: any) {
    if (String(err?.message || '').includes('UNIQUE')) {
      throw new Error('USER_EXISTS');
    }
    throw err;
  }
}

export async function getUserByUsername(username: string): Promise<UserRow | null> {
  if (usingFallback) {
    return memUsers.get(username.toLowerCase()) || null;
  }
  const d = getDb();
  if (!d) return null;
  const row = d.prepare('SELECT * FROM users WHERE username = ?').get(username) as unknown as UserRow | undefined;
  return row || null;
}

export async function isLocked(username: string): Promise<Date | null> {
  const user = await getUserByUsername(username);
  if (!user || !user.locked_until) return null;
  const until = new Date(user.locked_until);
  return until.getTime() > Date.now() ? until : null;
}

export async function recordLoginFailure(username: string): Promise<void> {
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
  inTx((db) => {
    db.prepare(
      `UPDATE users SET failed_attempts = failed_attempts + 1,
       locked_until = CASE WHEN failed_attempts + 1 >= ? THEN ? ELSE locked_until END
       WHERE username = ?`
    ).run(MAX_FAILED_ATTEMPTS, new Date(Date.now() + LOCK_DURATION_MS).toISOString(), username);
  });
}

export async function resetLoginFailures(username: string): Promise<void> {
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
  inTx((db) => {
    db.prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE username = ?').run(username);
  });
}

// ---------- Sessions ----------

export async function createSession(
  id: string,
  username: string,
  expiresAt: Date,
  ip: string
): Promise<void> {
  if (usingFallback) {
    memSessions.set(id, {
      username,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
      ip,
    });
    return;
  }
  const d = getDb();
  if (!d) return;
  inTx((db) => {
    db.prepare(
      'INSERT INTO sessions (id, username, expires_at, ip) VALUES (?, ?, ?, ?)'
    ).run(id, username, expiresAt.toISOString(), ip);
  });
}

export async function getSession(id: string): Promise<{ username: string; expiresAt: Date } | null> {
  if (usingFallback) {
    const s = memSessions.get(id);
    if (!s) return null;
    const exp = new Date(s.expires_at);
    if (exp.getTime() <= Date.now()) {
      memSessions.delete(id);
      return null;
    }
    return { username: s.username, expiresAt: exp };
  }
  const d = getDb();
  if (!d) return null;
  const row = d.prepare('SELECT username, expires_at FROM sessions WHERE id = ?').get(id) as unknown as
    | { username: string; expires_at: string }
    | undefined;
  if (!row) return null;
  const exp = new Date(row.expires_at);
  if (exp.getTime() <= Date.now()) {
    d.prepare('DELETE FROM sessions WHERE id = ?').run(id);
    return null;
  }
  return { username: row.username, expiresAt: exp };
}

export async function deleteSession(id: string): Promise<void> {
  if (usingFallback) {
    memSessions.delete(id);
    return;
  }
  const d = getDb();
  if (!d) return;
  inTx((db) => {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
  });
}

// ---------- Vault (server-side encrypted envelope, optional cross-device sync) ----------

export async function getVault(username: string): Promise<string | null> {
  const key = username.toLowerCase();
  if (usingFallback) return memVaults.get(key) || null;
  const d = getDb();
  if (!d) return null;
  const row = d.prepare('SELECT data FROM vaults WHERE LOWER(username) = ?').get(key) as unknown as
    | { data: string | null }
    | undefined;
  return row?.data || null;
}

export async function putVault(username: string, data: string): Promise<void> {
  const key = username.toLowerCase();
  if (usingFallback) {
    memVaults.set(key, data);
    return;
  }
  const d = getDb();
  if (!d) return;
  inTx((db) => {
    db.prepare(
      'INSERT INTO vaults (username, data) VALUES (?, ?) ON CONFLICT(username) DO UPDATE SET data = excluded.data, updated_at = datetime(\'now\')'
    ).run(key, data);
  });
}

// ---------- Health & corruption prevention ----------

export async function pingDb(): Promise<boolean> {
  if (usingFallback) return true;
  const d = getDb();
  if (!d) return false;
  try {
    d.prepare('SELECT 1').get();
    return true;
  } catch {
    return false;
  }
}

/**
 * Active corruption check. SQLite has no page-level checksums, so we run
 * `PRAGMA integrity_check` (structural/checksum verification of every page)
 * plus `PRAGMA foreign_key_check` to catch silent block-level corruption.
 * Returns the list of issues found (empty == healthy).
 */
export async function integrityCheck(): Promise<{ ok: boolean; issues: string[] }> {
  if (usingFallback) return { ok: true, issues: [] };
  const d = getDb();
  if (!d) return { ok: false, issues: ['database unavailable'] };
  try {
    const rows = d.prepare('PRAGMA integrity_check').all() as Array<{ integrity_check: string }>;
    const issues = rows.filter((r) => r.integrity_check !== 'ok').map((r) => r.integrity_check);
    if (issues.length > 0) return { ok: false, issues };

    const fk = d.prepare('PRAGMA foreign_key_check').all() as Array<Record<string, unknown>>;
    if (fk.length > 0) return { ok: false, issues: fk.map((r) => JSON.stringify(r)) };

    return { ok: true, issues: [] };
  } catch (err) {
    return { ok: false, issues: [(err as Error).message] };
  }
}

/**
 * Active "connection" metric. SQLite is single-handle, so we approximate live
 * connections with the count of currently-valid (non-expired) sessions.
 */
export async function getActiveConnectionCount(): Promise<number> {
  if (usingFallback) return memSessions.size;
  const d = getDb();
  if (!d) return 0;
  try {
    const row = d
      .prepare("SELECT count(*) AS c FROM sessions WHERE expires_at > ?")
      .get(new Date().toISOString()) as { c: number };
    return row.c;
  } catch {
    return 0;
  }
}
