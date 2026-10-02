const { createClient } = require('@supabase/supabase-js')

// Validar variáveis de ambiente
if (!process.env.SUPABASE_URL) {
  console.warn('⚠️ SUPABASE_URL não definido (usando placeholder)')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY não definido (usando placeholder)')
}

// Inicializar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
)

console.log('✅ Supabase client inicializado')

module.exports = supabase
