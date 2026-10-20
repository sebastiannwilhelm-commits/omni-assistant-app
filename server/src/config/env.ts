import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 3001,
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() || '',
  geminiModel: process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash',
  trnApiKey: process.env.TRN_API_KEY?.trim() || '',
  trnDefaultPlatform: process.env.TRN_DEFAULT_PLATFORM?.trim() || '5',
  trnDefaultUsername: process.env.TRN_DEFAULT_USERNAME?.trim() || '',
  tiktokAccessToken:
    process.env.TIKTOK_ACCESS_TOKEN?.trim() ||
    'YOUR_TIKTOK_OAUTH_ACCESS_TOKEN_HERE',
};

export function hasConfiguredGeminiApiKey(): boolean {
  return (
    Boolean(env.geminiApiKey) &&
    env.geminiApiKey !== 'your_gemini_api_key_here'
  );
}

export function hasConfiguredTrnApiKey(): boolean {
  return (
    Boolean(env.trnApiKey) &&
    env.trnApiKey !== 'your_tracker_network_api_key_here'
  );
}

export function hasConfiguredTikTokToken(): boolean {
  return (
    Boolean(env.tiktokAccessToken) &&
    env.tiktokAccessToken !== 'YOUR_TIKTOK_OAUTH_ACCESS_TOKEN_HERE' &&
    env.tiktokAccessToken !== 'your_tiktok_oauth_access_token_here'
  );
}
