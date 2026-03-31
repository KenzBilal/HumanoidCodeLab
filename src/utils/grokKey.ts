// Grok API Key - Base64 encoded to prevent simple extraction
// This is the default free key that comes with the app
// Rate-limited to prevent abuse
const GROK_KEY_ENCODED = 'Z3NrX09jTlBVUXhuVHRqNmZhWDZ6NnBUV0dkeWIzRllYVjdFSkhWU1ZMZUxGUTdwdjF1RTRLWm4=';

export function getGrokApiKey(): string {
  try {
    const decoded = Buffer.from(GROK_KEY_ENCODED, 'base64').toString('utf-8');
    return decoded;
  } catch {
    return '';
  }
}

export function isGrokKeyValid(): boolean {
  const key = getGrokApiKey();
  return key.length > 20;
}