import crypto from 'crypto';

const SECRET_KEY = process.env.DOWNLOAD_SECRET || 'instasave-secure-media-proxy-token-2026';
const ALGORITHM = 'aes-256-gcm';

// Derive 32-byte key from secret
const key = crypto.createHash('sha256').update(SECRET_KEY).digest();

export interface DownloadTokenPayload {
  url: string;
  filename: string;
  mimeType: string;
  shortcode?: string;
  exp: number; // unix timestamp
}

export interface ZipTokenPayload {
  shortcode: string;
  items: Array<{
    url: string;
    filename: string;
  }>;
  exp: number;
}

/**
 * Encrypt a download payload into a URL-safe token
 */
export function createDownloadToken(payload: Omit<DownloadTokenPayload, 'exp'>, expiresInSeconds = 7200): string {
  const fullPayload: DownloadTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const text = JSON.stringify(fullPayload);
  let encrypted = cipher.update(text, 'utf8', 'base64url');
  encrypted += cipher.final('base64url');
  
  const authTag = cipher.getAuthTag().toString('base64url');
  
  // Format: iv.authTag.encrypted
  return `${iv.toString('base64url')}.${authTag}.${encrypted}`;
}

/**
 * Decrypt and verify a download token
 */
export function verifyDownloadToken(token: string): DownloadTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [ivB64, authTagB64, encrypted] = parts;
    const iv = Buffer.from(ivB64, 'base64url');
    const authTag = Buffer.from(authTagB64, 'base64url');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'base64url', 'utf8');
    decrypted += decipher.final('utf8');

    const payload: DownloadTokenPayload = JSON.parse(decrypted);

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Encrypt a ZIP bundle payload into a URL-safe token
 */
export function createZipToken(payload: Omit<ZipTokenPayload, 'exp'>, expiresInSeconds = 7200): string {
  const fullPayload: ZipTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const text = JSON.stringify(fullPayload);
  let encrypted = cipher.update(text, 'utf8', 'base64url');
  encrypted += cipher.final('base64url');
  
  const authTag = cipher.getAuthTag().toString('base64url');
  
  return `${iv.toString('base64url')}.${authTag}.${encrypted}`;
}

/**
 * Decrypt and verify a ZIP bundle token
 */
export function verifyZipToken(token: string): ZipTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [ivB64, authTagB64, encrypted] = parts;
    const iv = Buffer.from(ivB64, 'base64url');
    const authTag = Buffer.from(authTagB64, 'base64url');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'base64url', 'utf8');
    decrypted += decipher.final('utf8');

    const payload: ZipTokenPayload = JSON.parse(decrypted);

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
