const fs = require('fs');
const path = require('path');

function printSupabaseSetupHint() {
  const envPath = path.join(__dirname, '..', '.env');
  const hasSupabase = Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));

  if (hasSupabase) {
    return;
  }

  const message = [
    'Supabase persistence is not configured yet.',
    'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in backend/.env or your Vercel environment variables.',
    `Expected env file: ${envPath}`
  ].join('\n');

  console.warn(message);
}

module.exports = { printSupabaseSetupHint };
