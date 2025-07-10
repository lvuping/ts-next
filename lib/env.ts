export const env = {
  APP_PASSWORD: process.env.APP_PASSWORD || 'changeme123',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;