const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos no .env');
}

const supabaseUrl = env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';

// Utilizando a service_role_key para o backend ter privilégios administrativos
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
