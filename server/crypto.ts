/**
 * Server-side cryptography for the Brio auth pipeline.
 *
 *  - Password hashing uses Argon2id (via the pure-WASM `hash-wasm` module) so
 *    that the server NEVER stores plaintext passwords. This is zero-knowledge
 *    for the vault: the server only ever sees the password transiently to
 *    verify it; the vault blob itself is encrypted client-side.
 *
 *  - Session tokens and at-rest sensitive payloads are sealed with AES-256-GCM
 *    (authenticated encryption) using a 32-byte master key persisted locally
 *    (or supplied via AES_MASTER_KEY). Under LiteFS the key lives inside the
 *    replicated mount so every node can validate tokens consistently.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { argon2id } from 'hash-wasm';

const ARGON2_PARAMS = {
  memorySize: 19456, // KiB (~19 MiB)
  iterations: 3,
  parallelism: 1,
  hashLength: 32,
};

const DATA_DIR = process.env.LITEFS_DIR
  ? path.join(process.env.LITEFS_DIR, 'data')
  : path.join(process.cwd(), 'data');

const AES_KEY_PATH = process.env.LITEFS_DIR
  ? path.join(process.env.LITEFS_DIR, 'aes-master.key')
  : path.join(DATA_DIR, 'aes-master.key');

function ensureDir(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ---------- Argon2id password hashing ----------

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const hash = await argon2id({
    password,
    salt,
    parallelism: ARGON2_PARAMS.parallelism,
    iterations: ARGON2_PARAMS.iterations,
    memorySize: ARGON2_PARAMS.memorySize,
    hashLength: ARGON2_PARAMS.hashLength,
    outputType: 'hex',
  });
  const saltB64 = salt.toString('base64');
  return `$argon2id$v=19$m=${ARGON2_PARAMS.memorySize},t=${ARGON2_PARAMS.iterations},p=${ARGON2_PARAMS.parallelism}$${saltB64}$${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split('$');
    if (parts.length !== 6 || parts[1] !== 'argon2id') return false;
    const paramStr = parts[3]; // m=..,t=..,p=..
    const saltB64 = parts[4];
    const expectedHash = parts[5];

    const getParam = (key: string): number => {
      const m = paramStr.match(new RegExp(`${key}=(\\d+)`));
      return m ? parseInt(m[1], 10) : 0;
    };

    const candidate = await argon2id({
      password,
      salt: Buffer.from(saltB64, 'base64'),
      parallelism: getParam('p'),
      iterations: getParam('t'),
      memorySize: getParam('m'),
      hashLength: ARGON2_PARAMS.hashLength,
      outputType: 'hex',
    });

    const a = Buffer.from(candidate, 'hex');
    const b = Buffer.from(expectedHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ---------- AES-256-GCM master key ----------

let cachedKey: Buffer | null = null;

function getAesKey(): Buffer {
  if (cachedKey) return cachedKey;
  if (process.env.AES_MASTER_KEY) {
    cachedKey = Buffer.from(process.env.AES_MASTER_KEY, 'hex');
    if (cachedKey.length !== 32) {
      throw new Error('AES_MASTER_KEY must be a 32-byte (64 hex char) key.');
    }
    return cachedKey;
  }
  try {
    if (fs.existsSync(AES_KEY_PATH)) {
      cachedKey = fs.readFileSync(AES_KEY_PATH);
      if (cachedKey.length === 32) return cachedKey;
    }
  } catch {
    /* fall through to generate */
  }
  ensureDir();
  cachedKey = crypto.randomBytes(32);
  try {
    fs.writeFileSync(AES_KEY_PATH, cachedKey, { mode: 0o600 });
  } catch (err) {
    console.error('⚠️ Could not persist AES master key:', (err as Error).message);
  }
  return cachedKey;
}

// ---------- AES-256-GCM authenticated encryption ----------

export function aesEncrypt(plaintext: string): string {
  const key = getAesKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Layout: [iv(12)] [tag(16)] [ciphertext]
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function aesDecrypt(payload: string): string {
  const key = getAesKey();
  const buf = Buffer.from(payload, 'base64');
  if (buf.length < 28) throw new Error('Malformed ciphertext');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
