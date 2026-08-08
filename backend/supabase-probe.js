const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
function loadEnvFile(envPath) {
  if (\!fs.existsSync(envPath)) return;
  const contents = fs.readFileSync(envPath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (\!trimmed || trimmed.startsWith('#')) return;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) return;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key) process.env[key] = value.replace(/^['"]|['"]$/g, '');
  });
}
loadEnvFile(path.join(process.cwd(), '.env'));
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
console.log('url present', Boolean(url), 'key present', Boolean(key));
const supabase = createClient(url, key, { auth: { persistSession: false } });
(async () => {
  const payload = {
    title: 'Supabase probe ' + Date.now(),
    subtitle: 'probe',
    description: 'probe',
    category: 'transportation',
    image_url: 'https://example.com/test.jpg',
    youtube_url: '',
    thumbnail_url: 'https://example.com/test.jpg',
    media_type: 'image',
    created_at: new Date().toISOString()
  };
  const { data, error } = await supabase.from('gallery_items').insert(payload).select().single();
  console.log(JSON.stringify({ error, data }, null, 2));
})();
