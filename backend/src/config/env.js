require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001,
  SOCKET_PORT: process.env.SOCKET_PORT || 3001,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  WHATSAPP_API_PROVIDER: process.env.WHATSAPP_API_PROVIDER || 'meta',
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_WEBHOOK_TOKEN: process.env.WHATSAPP_WEBHOOK_TOKEN,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret'
};
