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
  
  // 1. Emails
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  
  // 2. Monetary values (e.g., $100, $1,000.00, €50, £20.50)
  const moneyRegex = /([$€£¥][0-9,]+(\.[0-9]{2})?)/gi;
  
  // 3. Phone Numbers (US/International standard formats)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
  
  // 4. Social Security Numbers (SSN) - standard US format
  const ssnRegex = /\b(\d{3}-\d{2}-\d{4})\b/g;
  
  // 5. Credit Card Numbers (13-19 digits, optional spaces/dashes)
  const ccRegex = /\b(?:\d[ -]*?){13,19}\b/g;
  
  // 6. IPv4 Addresses
  const ipv4Regex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;

  let sanitized = rawPrompt;

  // Array of regexes to process
  const sensitiveRegexes = [
    emailRegex,
    moneyRegex,
    phoneRegex,
    ssnRegex,
    ccRegex,
    ipv4Regex
  ];

  // Process all patterns
  sensitiveRegexes.forEach(regex => {
    sanitized = sanitized.replace(regex, (match) => {
      // Small check to prevent encrypting numbers that are too small to be CCs but match the vague ccRegex
      if (regex === ccRegex && match.replace(/[- ]/g, '').length < 13) return match;
      return encryptEntity(match);
    });
  });

  return sanitized;
};
