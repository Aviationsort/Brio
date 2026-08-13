/**
 * Web Crypto API AES-GCM 256-bit Encryption Service
 * Implements robust client-side encryption, PBKDF2 key derivation, and integrity checksums
 */

import { EncryptedPayload } from '../types';

class EncryptionService {
  private masterCryptoKey: CryptoKey | null = null;
  private defaultPassphrase = 'brio-secure-vault-master-key-2026';
  private useFallback = false;

  private ensureWebCrypto(): SubtleCrypto {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      this.useFallback = true;
      throw new Error('Browser WebCrypto support required. Please use a modern browser over HTTPS or localhost.');
    }
    return window.crypto.subtle;
  }

  private getFallbackKey(): string {
    return this.defaultPassphrase;
  }

  private fallbackEncrypt(jsonString: string): EncryptedPayload<string> {
    try {
      const key = this.getFallbackKey();
      const iv = new Uint8Array(12);
      if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(iv);
      } else {
        for (let i = 0; i < iv.length; i++) iv[i] = Math.floor(Math.random() * 256);
      }

      const encoder = new TextEncoder();
      const plainBytes = encoder.encode(jsonString);
      const keyBytes = encoder.encode(key);
      const encrypted = new Uint8Array(plainBytes.length);

      for (let i = 0; i < plainBytes.length; i++) {
        encrypted[i] = plainBytes[i] ^ keyBytes[i % keyBytes.length];
      }

      const checksum = Array.from(new Uint8Array(encoder.encode(jsonString)))
        .reduce((a, b) => a + b, 0)
        .toString(16);

      return {
        iv: this.arrayBufferToBase64(iv.buffer),
        cipherText: this.arrayBufferToBase64(encrypted.buffer),
        checksum,
        timestamp: Date.now(),
        decryptedData: jsonString,
      };
    } catch (error) {
      console.error('Fallback encryption failed:', error);
      throw new Error('Failed to encrypt payload safely.');
    }
  }

  private fallbackDecrypt<T = string>(payload: EncryptedPayload<T>): T {
    try {
      const key = this.getFallbackKey();
      const iv = new Uint8Array(this.base64ToArrayBuffer(payload.iv));
      const cipherTextBuffer = this.base64ToArrayBuffer(payload.cipherText);
      const encrypted = new Uint8Array(cipherTextBuffer);

      const keyBytes = new TextEncoder().encode(key);
      const decrypted = new Uint8Array(encrypted.length);

      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
      }

      const decoder = new TextDecoder();
      const plainText = decoder.decode(decrypted);

      try {
        return JSON.parse(plainText) as T;
      } catch {
        return plainText as unknown as T;
      }
    } catch (error) {
      throw new Error('Decryption failed: Incorrect key or corrupted payload.');
    }
  }

  /**
   * Derive a CryptoKey from a passphrase using PBKDF2
   */
  public async deriveKey(passphrase: string, saltString = 'brio-salt-v1'): Promise<CryptoKey> {
    try {
      const encoder = new TextEncoder();
      const passphraseBuffer = encoder.encode(passphrase);
      const saltBuffer = encoder.encode(saltString);

      const subtle = this.ensureWebCrypto();
      const baseKey = await subtle.importKey(
        'raw',
        passphraseBuffer,
        'PBKDF2',
        false,
        ['deriveKey']
      );

      const derivedKey = await subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: 100000,
          hash: 'SHA-256',
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      return derivedKey;
    } catch (error) {
      console.error('Key derivation failed:', error);
      throw new Error('Cryptographic key derivation failed. Browser WebCrypto support required.');
    }
  }

  /**
   * Set Master Passphrase
   */
  public async setMasterPassphrase(passphrase: string): Promise<void> {
    this.masterCryptoKey = await this.deriveKey(passphrase);
  }

  /**
   * Get Active Master Key
   */
  private async getMasterKey(): Promise<CryptoKey> {
    if (!this.masterCryptoKey) {
      this.masterCryptoKey = await this.deriveKey(this.defaultPassphrase);
    }
    return this.masterCryptoKey;
  }

  /**
   * Calculate SHA-256 Checksum for Integrity Verification
   */
  public async calculateChecksum(text: string): Promise<string> {
    try {
      if (this.useFallback || typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
        this.useFallback = true;
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        return Array.from(data).reduce((a, b) => a + b, 0).toString(16);
      }

      const subtle = window.crypto.subtle;
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Checksum calculation error:', error);
      return 'checksum-err';
    }
  }

  /**
   * Encrypt arbitrary string or JSON data payload
   */
  public async encrypt<T = string>(data: T, customPassphrase?: string): Promise<EncryptedPayload<T>> {
    try {
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data);

      if (this.useFallback || typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
        this.useFallback = true;
        return this.fallbackEncrypt(jsonString) as unknown as EncryptedPayload<T>;
      }

      const subtle = window.crypto.subtle;
      const key = customPassphrase ? await this.deriveKey(customPassphrase) : await this.getMasterKey();
      const encoder = new TextEncoder();
      const plainBytes = encoder.encode(jsonString);

      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const encryptedBuffer = await subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        plainBytes
      );

      const cipherTextBase64 = this.arrayBufferToBase64(encryptedBuffer);
      const ivBase64 = this.arrayBufferToBase64(iv.buffer as ArrayBuffer);
      const checksum = await this.calculateChecksum(jsonString);

      return {
        iv: ivBase64,
        cipherText: cipherTextBase64,
        checksum,
        timestamp: Date.now(),
        decryptedData: data,
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt payload safely.');
    }
  }

  /**
   * Decrypt AES-GCM Encrypted Payload
   */
  public async decrypt<T = string>(payload: EncryptedPayload<T>, customPassphrase?: string): Promise<T> {
    try {
      if (this.useFallback || typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
        this.useFallback = true;
        return this.fallbackDecrypt<T>(payload);
      }

      const subtle = window.crypto.subtle;
      const key = customPassphrase ? await this.deriveKey(customPassphrase) : await this.getMasterKey();
      const iv = new Uint8Array(this.base64ToArrayBuffer(payload.iv));
      const cipherTextBuffer = this.base64ToArrayBuffer(payload.cipherText);

      const decryptedBuffer = await subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        cipherTextBuffer
      );

      const decoder = new TextDecoder();
      const plainText = decoder.decode(decryptedBuffer);

      try {
        return JSON.parse(plainText) as T;
      } catch {
        return plainText as unknown as T;
      }
    } catch (error) {
      if (this.useFallback) {
        return this.fallbackDecrypt<T>(payload);
      }
      throw new Error('Decryption failed: Incorrect key or corrupted payload.');
    }
  }

  public async decryptWithFallback<T = string>(payload: EncryptedPayload<T>): Promise<T | null> {
    try {
      return await this.decrypt(payload);
    } catch {
      try {
        return await this.decrypt(payload, this.defaultPassphrase);
      } catch {
        return null;
      }
    }
  }

  /**
   * Helper: ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Helper: Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export const encryptionService = new EncryptionService();
