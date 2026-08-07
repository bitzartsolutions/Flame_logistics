const { createClient } = require('@supabase/supabase-js');

function normalizeSupabaseUrl(url) {
  if (!url) return '';

  return String(url)
    .trim()
    .replace(/\/+$|\/rest\/v1\/?$/g, '');
}

function getSupabaseClient() {
  const supabaseUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL);
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in backend/.env or Vercel environment variables.');
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
}

module.exports = { getSupabaseClient };