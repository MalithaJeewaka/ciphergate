import CryptoJS from 'crypto-js';

const CLIENT_ENCRYPTION_KEY = 'super-secret-client-key-123';
const HMAC_SHARED_SECRET = 'enterprise-shared-hmac-secret-456';

export const encryptEntity = (text) => {
  const ciphertext = CryptoJS.AES.encrypt(text, CLIENT_ENCRYPTION_KEY).toString();
  return `[ENC:${ciphertext}]`;
};

export const decryptEntity = (encryptedToken) => {
  try {
    // Expected format: [ENC:ciphertext]
    const match = encryptedToken.match(/^\[ENC:(.*)\]$/);
    if (!match) return encryptedToken; // Return raw if not in expected format
    
    const ciphertext = match[1];
    const bytes = CryptoJS.AES.decrypt(ciphertext, CLIENT_ENCRYPTION_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    return originalText || encryptedToken; // Return original if decryption fails
  } catch (error) {
    console.error("Decryption error:", error);
    return encryptedToken;
  }
};

export const generateHMAC = (payload) => {
  return CryptoJS.HmacSHA256(payload, HMAC_SHARED_SECRET).toString(CryptoJS.enc.Hex);
};

export const sanitizeEnterprisePrompt = (rawPrompt) => {
  if (!rawPrompt) return '';
  
  // Regex to match emails
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  // Regex to match monetary values (e.g., $100, $1,000.00)
  const moneyRegex = /(\$[0-9,]+(\.[0-9]{2})?)/gi;

  let sanitized = rawPrompt;

  // Replace emails
  sanitized = sanitized.replace(emailRegex, (match) => {
    return encryptEntity(match);
  });

  // Replace monetary values
  sanitized = sanitized.replace(moneyRegex, (match) => {
    return encryptEntity(match);
  });

  return sanitized;
};
