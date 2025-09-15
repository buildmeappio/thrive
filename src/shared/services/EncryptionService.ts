import crypto from 'crypto';

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits
  private readonly key: Buffer;

  constructor() {
    // In production, use a proper key management system
    const encryptionKey = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!';
    this.key = crypto.scryptSync(encryptionKey, 'salt', this.keyLength);
  }

  async encrypt(text: string): Promise<string> {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, this.key);
      cipher.setAAD(Buffer.from('additional-data')); // Additional authenticated data

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      // Combine iv, tag, and encrypted data
      const result = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
      return result;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Encryption failed');
    }
  }

  async decrypt(encryptedText: string): Promise<string> {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const tag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipher(this.algorithm, this.key);
      decipher.setAuthTag(tag);
      decipher.setAAD(Buffer.from('additional-data'));

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed');
    }
  }

  async encryptJson(data: any): Promise<any> {
    try {
      const jsonString = JSON.stringify(data);
      return await this.encrypt(jsonString);
    } catch (error) {
      console.error('JSON encryption error:', error);
      throw new Error('JSON encryption failed');
    }
  }

  async decryptJson(encryptedData: any): Promise<any> {
    try {
      if (typeof encryptedData !== 'string') {
        return encryptedData; // Return as-is if not encrypted
      }

      const decryptedString = await this.decrypt(encryptedData);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('JSON decryption error:', error);
      // Return original data if decryption fails (might not be encrypted)
      return encryptedData;
    }
  }

  // Hash function for one-way encryption (passwords, etc.)
  async hash(text: string): Promise<string> {
    const salt = crypto.randomBytes(16);
    const hash = crypto.pbkdf2Sync(text, salt, 10000, 64, 'sha512');
    return salt.toString('hex') + ':' + hash.toString('hex');
  }

  async verifyHash(text: string, hash: string): Promise<boolean> {
    try {
      const parts = hash.split(':');
      if (parts.length !== 2) {
        return false;
      }

      const salt = Buffer.from(parts[0], 'hex');
      const originalHash = parts[1];
      const testHash = crypto.pbkdf2Sync(text, salt, 10000, 64, 'sha512').toString('hex');

      return originalHash === testHash;
    } catch (error) {
      console.error('Hash verification error:', error);
      return false;
    }
  }
}
