/**
 * Brio Application .db Database Engine
 * Manages full app state persistence, SQLite/.db format file export and import,
 * encrypted table storage, and database integrity verification.
 */

import { encryptionService } from './crypto';
import { apiClient } from './apiClient';

function usernameFromKey(dbKey: string): string {
  return dbKey.replace(/^vault_/, '');
}

function readSessionToken(): string {
  try {
    return localStorage.getItem('brio_session') || '';
  } catch {
    return '';
  }
}

export interface DatabaseMetadata {
  version: string;
  databaseName: string;
  createdAt: string;
  lastModified: string;
  tables: string[];
  totalRecords: number;
  checksum: string;
  sizeBytes: number;
}

export interface BrioDatabaseDump {
  metadata: DatabaseMetadata;
  data: {
    users?: any[];
    chats?: any[];
    socialPosts?: any[];
    stickers?: any[];
    mediaTracks?: any[];
    iptvChannels?: any[];
    notes?: any[];
    todos?: any[];
    calendarEvents?: any[];
    myPlanePics?: any[];
    settings?: any;
  };
}

const DB_STORAGE_PREFIX = 'brio_master_db_';
const DB_METADATA_PREFIX = 'brio_db_metadata_';
const DB_BACKUP_PREFIX = 'brio_db_last_backup_';
const DB_INDEXEDDB_NAME = 'brio_vault_store';
const DB_INDEXEDDB_STORE = 'vaults';
const DB_INDEXEDDB_KEY = 'default_vault';

function storageKeyFor(dbKey: string): string {
  return `${DB_STORAGE_PREFIX}${dbKey}`;
}
function metadataKeyFor(dbKey: string): string {
  return `${DB_METADATA_PREFIX}${dbKey}`;
}
function backupKeyFor(dbKey: string): string {
  return `${DB_BACKUP_PREFIX}${dbKey}`;
}

type MigrationFn = (dump: BrioDatabaseDump) => Promise<BrioDatabaseDump>;

const MIGRATIONS: Record<string, MigrationFn> = {
  '1.0.0': async (dump) => {
    const next = { ...dump, metadata: { ...dump.metadata, version: '2.0.0-DB' } };
    return next as BrioDatabaseDump;
  },
};

class DatabaseManager {
  private computeChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `INT-${Math.abs(hash).toString(16).toUpperCase()}`;
  }

  private computeSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private async openIndexedDB(): Promise<IDBDatabase | null> {
    try {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_INDEXEDDB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(DB_INDEXEDDB_STORE)) {
            db.createObjectStore(DB_INDEXEDDB_STORE);
          }
        };
      });
    } catch {
      return null;
    }
  }

  async saveVaultToIndexedDB(blob: Blob, key: string = DB_INDEXEDDB_KEY): Promise<boolean> {
    try {
      const db = await this.openIndexedDB();
      if (!db) return false;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_INDEXEDDB_STORE, 'readwrite');
        const store = tx.objectStore(DB_INDEXEDDB_STORE);
        const request = store.put(blob, key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(true);
        tx.oncomplete = () => db.close();
      });
    } catch {
      return false;
    }
  }

  async loadVaultFromIndexedDB(key: string = DB_INDEXEDDB_KEY): Promise<Blob | null> {
    try {
      const db = await this.openIndexedDB();
      if (!db) return null;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_INDEXEDDB_STORE, 'readonly');
        const store = tx.objectStore(DB_INDEXEDDB_STORE);
        const request = store.get(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          db.close();
          resolve(request.result || null);
        };
        tx.oncomplete = () => db.close();
      });
    } catch {
      return null;
    }
  }

  async clearVaultFromIndexedDB(key: string = DB_INDEXEDDB_KEY): Promise<boolean> {
    try {
      const db = await this.openIndexedDB();
      if (!db) return false;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_INDEXEDDB_STORE, 'readwrite');
        const store = tx.objectStore(DB_INDEXEDDB_STORE);
        const request = store.delete(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(true);
        tx.oncomplete = () => db.close();
      });
    } catch {
      return false;
    }
  }

  async migrate(dump: BrioDatabaseDump): Promise<BrioDatabaseDump> {
    if (!dump.metadata) {
      dump.metadata = {
        version: '1.0.0',
        databaseName: 'brio_master_vault.db',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tables: [],
        totalRecords: 0,
        checksum: '',
        sizeBytes: 0,
      };
    }

    const currentVersion = dump.metadata.version || '1.0.0';
    const targetVersion = '2.0.0-DB';

    if (currentVersion === targetVersion) {
      return dump;
    }

    let migrated = { ...dump };
    for (const [version, fn] of Object.entries(MIGRATIONS)) {
      if (this.shouldMigrate(migrated.metadata.version || '1.0.0', version, targetVersion)) {
        migrated = await fn(migrated);
      }
    }
    return migrated;
  }

  private shouldMigrate(current: string, migrationVersion: string, target: string): boolean {
    return current !== target;
  }

  async verifyIntegrity(dump: BrioDatabaseDump): Promise<boolean> {
    try {
      const raw = JSON.stringify(dump.data);
      const computed = this.computeChecksum(raw);
      return computed === dump.metadata.checksum;
    } catch {
      return false;
    }
  }

  async saveDatabase(dumpData: BrioDatabaseDump['data'], dbKey: string = DB_INDEXEDDB_KEY): Promise<boolean> {
    try {
      const recordsCount =
        (dumpData.users?.length || 0) +
        (dumpData.chats?.length || 0) +
        (dumpData.socialPosts?.length || 0) +
        (dumpData.stickers?.length || 0) +
        (dumpData.mediaTracks?.length || 0) +
        (dumpData.iptvChannels?.length || 0) +
        (dumpData.notes?.length || 0) +
        (dumpData.todos?.length || 0) +
        (dumpData.myPlanePics?.length || 0);

      const rawJson = JSON.stringify(dumpData);
      const checksum = this.computeChecksum(rawJson);
      const sizeBytes = this.computeSize(dumpData);

      const metadata: DatabaseMetadata = {
        version: '2.0.0-DB',
        databaseName: dbKey,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tables: Object.keys(dumpData).filter(k => k !== 'settings' || dumpData.settings !== undefined),
        totalRecords: recordsCount,
        checksum,
        sizeBytes,
      };

      const fullDump: BrioDatabaseDump = {
        metadata,
        data: dumpData,
      };

      const plainJson = JSON.stringify(fullDump);
      const encrypted = await encryptionService.encrypt(plainJson);
      const payloadString = JSON.stringify(encrypted);

      console.info('[DB] saveDatabase', {
        dbKey,
        storageKey: storageKeyFor(dbKey),
        metadataKey: metadataKeyFor(dbKey),
        payloadLength: payloadString.length,
        tables: metadata.tables,
        totalRecords: metadata.totalRecords,
      });

      localStorage.setItem(storageKeyFor(dbKey), payloadString);
      localStorage.setItem(metadataKeyFor(dbKey), JSON.stringify(metadata));

      const token = readSessionToken();
      if (token) {
        await apiClient.vault.put(usernameFromKey(dbKey), token, payloadString);
      }

      return true;
    } catch (err) {
      console.error('Failed to save database:', err);
      return false;
    }
  }

  async loadDatabase(dbKey: string = DB_INDEXEDDB_KEY): Promise<BrioDatabaseDump | null> {
    const parseDump = async (rawJson: string | null, source: string): Promise<BrioDatabaseDump | null> => {
      console.info('[DB] loadDatabase parseDump', { source, rawType: rawJson?.slice(0, 20) });
      if (!rawJson || typeof rawJson !== 'string') {
        console.warn('[DB] loadDatabase parseDump empty/non-string', { source });
        return null;
      }
      let parsed: any;
      try {
        parsed = JSON.parse(rawJson);
      } catch (e) {
        console.warn('[DB] loadDatabase parseDump JSON.parse failed', { source, error: String(e) });
        return null;
      }
      if (parsed && typeof parsed === 'object' && parsed.iv && parsed.cipherText) {
        try {
          const decrypted = await encryptionService.decrypt<any>(parsed);
          if (!decrypted) {
            console.warn('[DB] loadDatabase parseDump decrypt returned null', { source });
            return null;
          }
          const trimmed = typeof decrypted === 'string' ? decrypted.trim() : decrypted;
          if (typeof trimmed === 'string') {
            try {
              const parsed2 = JSON.parse(trimmed) as BrioDatabaseDump;
              console.info('[DB] loadDatabase parseDump success from decrypted JSON', { source, hasMetadata: !!parsed2.metadata, tables: parsed2.metadata?.tables });
              return parsed2;
            } catch (e) {
              console.warn('[DB] loadDatabase parseDump JSON.parse(decrypted) failed', { source, error: String(e), decryptedSnippet: trimmed.slice(0, 100) });
              return null;
            }
          }
          console.info('[DB] loadDatabase parseDump success from decrypted object', { source, hasMetadata: !!trimmed.metadata, tables: trimmed.metadata?.tables });
          return trimmed as BrioDatabaseDump;
        } catch (e) {
          console.warn('[DB] loadDatabase parseDump decrypt threw', { source, error: String(e) });
          return null;
        }
      }
      if (typeof parsed === 'object' && parsed !== null) {
        console.info('[DB] loadDatabase parseDump success plain object', { source, hasMetadata: !!parsed.metadata, tables: parsed.metadata?.tables });
        return parsed as BrioDatabaseDump;
      }
      console.warn('[DB] loadDatabase parseDump unhandled shape', { source, parsedType: typeof parsed });
      return null;
    };

    try {
      const token = readSessionToken();
      console.info('[DB] loadDatabase start', { dbKey, username: usernameFromKey(dbKey), hasToken: !!token });

      const data = token ? await apiClient.vault.get(usernameFromKey(dbKey), token) : null;
      console.info('[DB] loadDatabase server result', { source: 'server', dataType: typeof data, dataSnippet: typeof data === 'string' ? data.slice(0, 60) : data });

      const fromServer = await parseDump(data, 'server');
      if (fromServer) {
        console.info('[DB] loadDatabase using server vault');
        return this.migrate(fromServer);
      }

      const cached = localStorage.getItem(storageKeyFor(dbKey));
      console.info('[DB] loadDatabase cache result', { source: 'localStorage', cachedType: typeof cached, cachedSnippet: typeof cached === 'string' ? cached.slice(0, 60) : cached });

      const fromCache = await parseDump(cached, 'localStorage');
      if (fromCache) {
        console.info('[DB] loadDatabase using localStorage cache');
        return this.migrate(fromCache);
      }
      console.warn('[DB] loadDatabase both sources failed', { dbKey, storageKey: storageKeyFor(dbKey), metadataKey: metadataKeyFor(dbKey) });
      return null;
    } catch (err) {
      console.error('[DB] loadDatabase outer error:', err);
      try {
        const cached = localStorage.getItem(storageKeyFor(dbKey));
        const fromCache = await parseDump(cached, 'localStorage-fallback');
        if (fromCache) return this.migrate(fromCache);
        return null;
      } catch {
        return null;
      }
    }
  }

  async exportDatabaseFile(dumpData: BrioDatabaseDump['data']): Promise<Blob> {
    try {
      const recordsCount =
        (dumpData.users?.length || 0) +
        (dumpData.chats?.length || 0) +
        (dumpData.socialPosts?.length || 0) +
        (dumpData.stickers?.length || 0) +
        (dumpData.mediaTracks?.length || 0) +
        (dumpData.iptvChannels?.length || 0) +
        (dumpData.notes?.length || 0) +
        (dumpData.todos?.length || 0) +
        (dumpData.myPlanePics?.length || 0);

      const rawJson = JSON.stringify(dumpData);
      const checksum = this.computeChecksum(rawJson);
      const sizeBytes = this.computeSize(dumpData);

      const metadata: DatabaseMetadata = {
        version: '2.0.0-DB',
        databaseName: 'brio_master_vault.db',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tables: Object.keys(dumpData).filter(k => k !== 'settings' || dumpData.settings !== undefined),
        totalRecords: recordsCount,
        checksum,
        sizeBytes,
      };

      const fullDump: BrioDatabaseDump = {
        metadata,
        data: dumpData,
      };

      const plainJson = JSON.stringify(fullDump, null, 2);
      const encrypted = await encryptionService.encrypt(plainJson);

      const filePayload = {
        format: 'BRIO-DB',
        encrypted: true,
        timestamp: Date.now(),
        payload: encrypted,
      };

      const fileContent = JSON.stringify(filePayload, null, 2);
      const blob = new Blob([fileContent], { type: 'application/octet-stream' });
      return blob;
    } catch (err) {
      console.error('Export DB Error:', err);
      throw new Error('Failed to export .db database file');
    }
  }

  async triggerDatabaseDownload(dumpData: BrioDatabaseDump['data'], filename?: string): Promise<void> {
    const blob = await this.exportDatabaseFile(dumpData);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `brio_vault_database_${new Date().toISOString().slice(0, 10)}.db`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async loadDatabaseFromFile(file: File): Promise<BrioDatabaseDump | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          let plainJson: string;

          try {
            const parsed = JSON.parse(content);
            if (parsed && parsed.format === 'BRIO-DB' && parsed.encrypted && parsed.payload) {
              const decrypted = await encryptionService.decrypt(parsed.payload);
              if (!decrypted) {
                throw new Error('Decryption failed: Incorrect key or corrupted payload.');
              }
              plainJson = decrypted as string;
            } else {
              plainJson = content;
            }
          } catch {
            plainJson = content;
          }

          if (plainJson.startsWith('ENC:')) {
            const payloadStr = plainJson.slice(4);
            let payload: any;
            try {
              payload = JSON.parse(payloadStr);
            } catch {
              payload = payloadStr;
            }
            const dec = await encryptionService.decryptWithFallback(payload);
            if (!dec) {
              throw new Error('Decryption failed: Incorrect key or corrupted payload.');
            }
            plainJson = dec as string;
          }

          const parsed = JSON.parse(plainJson) as BrioDatabaseDump;
          if (!parsed || !parsed.metadata || !parsed.data) {
            throw new Error('Invalid .db database file structure');
          }

          const valid = await this.verifyIntegrity(parsed);
          if (!valid) {
            throw new Error('Database integrity check failed. The file may be corrupted.');
          }

          const migrated = await this.migrate(parsed);
          resolve(migrated);
        } catch (err: any) {
          reject(new Error(err.message || 'Failed to parse .db database file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read .db file'));
      reader.readAsText(file);
    });
  }

  async importDatabaseFile(file: File, dbKey: string = DB_INDEXEDDB_KEY): Promise<BrioDatabaseDump> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          let plainJson: string;

          try {
            const parsed = JSON.parse(content);
            if (parsed && parsed.format === 'BRIO-DB' && parsed.encrypted && parsed.payload) {
              const decrypted = await encryptionService.decrypt(parsed.payload);
              if (!decrypted) {
                throw new Error('Decryption failed: Incorrect key or corrupted payload.');
              }
              plainJson = decrypted as string;
            } else {
              plainJson = content;
            }
          } catch {
            plainJson = content;
          }

          if (plainJson.startsWith('ENC:')) {
            const payloadStr = plainJson.slice(4);
            let payload: any;
            try {
              payload = JSON.parse(payloadStr);
            } catch {
              payload = payloadStr;
            }
            const dec = await encryptionService.decryptWithFallback(payload);
            if (!dec) {
              throw new Error('Decryption failed: Incorrect key or corrupted payload.');
            }
            plainJson = dec as string;
          }

          const parsed = JSON.parse(plainJson) as BrioDatabaseDump;
          if (!parsed || !parsed.metadata || !parsed.data) {
            throw new Error('Invalid .db database file structure');
          }

          const valid = await this.verifyIntegrity(parsed);
          if (!valid) {
            throw new Error('Database integrity check failed. The file may be corrupted.');
          }

          const migrated = await this.migrate(parsed);
          await this.saveDatabase(migrated.data, dbKey);
          resolve(migrated);
        } catch (err: any) {
          reject(new Error(err.message || 'Failed to parse .db database file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read .db file'));
      reader.readAsText(file);
    });
  }

  async backupDatabase(dumpData: BrioDatabaseDump['data'], dbKey: string = DB_INDEXEDDB_KEY): Promise<string> {
    try {
      await this.saveDatabase(dumpData, dbKey);
      const blob = await this.exportDatabaseFile(dumpData);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `brio_vault_backup_${dbKey}_${new Date().toISOString().slice(0, 10)}.db`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      const now = new Date().toISOString();
      localStorage.setItem(backupKeyFor(dbKey), now);
      return now;
    } catch (err) {
      console.error('Backup failed:', err);
      throw new Error('Failed to backup database');
    }
  }

  async restoreDatabase(file: File): Promise<BrioDatabaseDump> {
    try {
      const result = await this.importDatabaseFile(file);
      return result;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to restore database');
    }
  }

  getDatabaseMetadata(dbKey: string = DB_INDEXEDDB_KEY): DatabaseMetadata | null {
    try {
      const stored = localStorage.getItem(metadataKeyFor(dbKey));
      if (stored) return JSON.parse(stored) as DatabaseMetadata;
      return null;
    } catch {
      return null;
    }
  }

  getDatabaseSize(dbKey: string = DB_INDEXEDDB_KEY): number {
    try {
      const stored = localStorage.getItem(storageKeyFor(dbKey));
      if (stored) return new Blob([stored]).size;
      return 0;
    } catch {
      return 0;
    }
  }

  getLastBackupTime(dbKey: string = DB_INDEXEDDB_KEY): string | null {
    return localStorage.getItem(backupKeyFor(dbKey));
  }

  async clearDatabase(dbKey: string = DB_INDEXEDDB_KEY): Promise<boolean> {
    try {
      localStorage.removeItem(storageKeyFor(dbKey));
      localStorage.removeItem(metadataKeyFor(dbKey));
      await this.clearVaultFromIndexedDB(dbKey);
      return true;
    } catch {
      return false;
    }
  }
}

export const dbManager = new DatabaseManager();
