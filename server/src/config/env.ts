import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 3001,
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() || '',
  geminiModel: process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash',
};

export function hasConfiguredGeminiApiKey(): boolean {
  return (
    Boolean(env.geminiApiKey) &&
    env.geminiApiKey !== 'your_gemini_api_key_here'
  );
}
