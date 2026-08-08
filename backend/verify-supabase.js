const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    process.env[key] = value;
  }
}
const { createContent } = require('./src/contentStore');
(async () => {
  const payload = {
    title: 'Debug YouTube',
    subtitle: 'Test',
    description: 'Debug',
    category: 'transportation',
    imageUrl: '',
    youtubeUrl: 'https://youtu.be/abc123',
    thumbnailUrl: 'https://img.youtube.com/vi/abc123/hqdefault.jpg',
    mediaType: 'video',
    created_at: new Date().toISOString()
  };
  const result = await createContent('gallery', payload);
  console.log(JSON.stringify(result, null, 2));
})();
