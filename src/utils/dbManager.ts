/**
 * Brio Application .db Database Engine
 * Manages full app state persistence, SQLite/.db format file export and import,
 * encrypted table storage, and database integrity verification.
 */

import { encryptionService } from './crypto';

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
    myPlanePics?: any[];
    settings?: any;
  };
}

const DB_STORAGE_KEY = 'brio_master_db_v1';
const DB_METADATA_KEY = 'brio_db_metadata';
const DB_BACKUP_KEY = 'brio_db_last_backup';
const DB_INDEXEDDB_NAME = 'brio_vault_store';
const DB_INDEXEDDB_STORE = 'vaults';
const DB_INDEXEDDB_KEY = 'default_vault';

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

  async saveVaultToIndexedDB(blob: Blob): Promise<boolean> {
    try {
      const db = await this.openIndexedDB();
      if (!db) return false;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_INDEXEDDB_STORE, 'readwrite');
        const store = tx.objectStore(DB_INDEXEDDB_STORE);
        const request = store.put(blob, DB_INDEXEDDB_KEY);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(true);
        tx.oncomplete = () => db.close();
      });
    } catch {
      return false;
    }
  }

  async loadVaultFromIndexedDB(): Promise<Blob | null> {
    try {
      const db = await this.openIndexedDB();
      if (!db) return null;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_INDEXEDDB_STORE, 'readonly');
        const store = tx.objectStore(DB_INDEXEDDB_STORE);
        const request = store.get(DB_INDEXEDDB_KEY);
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

  async clearVaultFromIndexedDB(): Promise<boolean> {
    try {
      const db = await this.openIndexedDB();
      if (!db) return false;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_INDEXEDDB_STORE, 'readwrite');
        const store = tx.objectStore(DB_INDEXEDDB_STORE);
        const request = store.delete(DB_INDEXEDDB_KEY);
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

  async saveDatabase(dumpData: BrioDatabaseDump['data']): Promise<boolean> {
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

      const plainJson = JSON.stringify(fullDump);
      const encrypted = await encryptionService.encrypt(plainJson);
      const payloadString = JSON.stringify(encrypted);

      const blob = new Blob([payloadString], { type: 'application/octet-stream' });
      await this.saveVaultToIndexedDB(blob);

      try {
        localStorage.setItem(DB_STORAGE_KEY, payloadString);
        localStorage.setItem(DB_METADATA_KEY, JSON.stringify(metadata));
      } catch {
        // localStorage full or unavailable; IndexedDB is primary
      }

      return true;
    } catch (err) {
      console.error('Failed to save database:', err);
      return false;
    }
  }

  async loadDatabase(): Promise<BrioDatabaseDump | null> {
    try {
      const vaultBlob = await this.loadVaultFromIndexedDB();
      if (vaultBlob) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const stored = reader.result as string;
              let rawJson = stored;
              if (stored.startsWith('ENC:')) {
                const payloadStr = stored.slice(4);
                let payload: any;
                try {
                  payload = JSON.parse(payloadStr);
                } catch {
                  payload = payloadStr;
                }
                const decrypted = await encryptionService.decryptWithFallback(payload);
                if (decrypted) {
                  rawJson = decrypted;
                } else {
                  resolve(null);
                  return;
                }
              }

              if (typeof rawJson !== 'string') {
                resolve(rawJson as BrioDatabaseDump);
                return;
              }

              const parsed = JSON.parse(rawJson) as BrioDatabaseDump;
              const migrated = await this.migrate(parsed);
              resolve(migrated);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsText(vaultBlob);
        });
      }

      const stored = localStorage.getItem(DB_STORAGE_KEY);
      if (!stored) return null;

      let rawJson = stored;
      if (stored.startsWith('ENC:')) {
        const payloadStr = stored.slice(4);
        let payload: any;
        try {
          payload = JSON.parse(payloadStr);
        } catch {
          payload = payloadStr;
        }
        const decrypted = await encryptionService.decryptWithFallback(payload);
        if (decrypted) {
          rawJson = decrypted;
        } else {
          localStorage.removeItem(DB_STORAGE_KEY);
          return null;
        }
      }

      if (typeof rawJson !== 'string') {
        return rawJson as BrioDatabaseDump;
      }

      const parsed = JSON.parse(rawJson) as BrioDatabaseDump;
      const migrated = await this.migrate(parsed);
      return migrated;
    } catch (err) {
      console.error('Failed to load database:', err);
      return null;
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
      localStorage.setItem(DB_BACKUP_KEY, new Date().toISOString());
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
          await this.saveDatabase(migrated.data);
          resolve(migrated);
        } catch (err: any) {
          reject(new Error(err.message || 'Failed to parse .db database file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read .db file'));
      reader.readAsText(file);
    });
  }

  async importDatabaseFile(file: File): Promise<BrioDatabaseDump> {
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
          await this.saveDatabase(migrated.data);
          resolve(migrated);
        } catch (err: any) {
          reject(new Error(err.message || 'Failed to parse .db database file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read .db file'));
      reader.readAsText(file);
    });
  }

  async backupDatabase(dumpData: BrioDatabaseDump['data']): Promise<string> {
    try {
      await this.saveDatabase(dumpData);
      const blob = await this.exportDatabaseFile(dumpData);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `brio_vault_backup_${new Date().toISOString().slice(0, 10)}.db`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      const now = new Date().toISOString();
      localStorage.setItem(DB_BACKUP_KEY, now);
      return now;
    } catch (err) {
      console.error('Backup failed:', err);
      throw new Error('Failed to backup database');
    }
  }

  async restoreDatabase(file: File): Promise<BrioDatabaseDump> {
    try {
      const result = await this.importDatabaseFile(file);
      localStorage.setItem(DB_BACKUP_KEY, new Date().toISOString());
      return result;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to restore database');
    }
  }

  getDatabaseMetadata(): DatabaseMetadata | null {
    try {
      const stored = localStorage.getItem(DB_METADATA_KEY);
      if (stored) return JSON.parse(stored) as DatabaseMetadata;
      return null;
    } catch {
      return null;
    }
  }

  getDatabaseSize(): number {
    try {
      const stored = localStorage.getItem(DB_STORAGE_KEY);
      if (stored) return new Blob([stored]).size;
      return 0;
    } catch {
      return 0;
    }
  }

  getLastBackupTime(): string | null {
    return localStorage.getItem(DB_BACKUP_KEY);
  }

  async clearDatabase(): Promise<boolean> {
    try {
      localStorage.removeItem(DB_STORAGE_KEY);
      localStorage.removeItem(DB_METADATA_KEY);
      await this.clearVaultFromIndexedDB();
      return true;
    } catch {
      return false;
    }
  }
}

export const dbManager = new DatabaseManager();
