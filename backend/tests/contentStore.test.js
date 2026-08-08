const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('createContent falls back to local storage when Supabase is unavailable', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flame-content-store-'));
  process.env.DATA_DIR = tempDir;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_ANON_KEY;

  delete require.cache[require.resolve('../src/storage')];
  delete require.cache[require.resolve('../src/contentStore')];

  const { createContent, getContent } = require('../src/contentStore');
  const payload = { id: 999, title: 'Fallback gallery item', imageUrl: 'https://example.com/fallback.jpg' };

  const saved = await createContent('gallery', payload);
  const items = await getContent('gallery', []);

  assert.equal(saved.title, 'Fallback gallery item');
  assert.ok(items.some((item) => item.id === 999));
  assert.equal(fs.existsSync(path.join(tempDir, 'gallery.json')), true);

  delete process.env.DATA_DIR;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_ANON_KEY;
  delete require.cache[require.resolve('../src/storage')];
  delete require.cache[require.resolve('../src/contentStore')];
  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('createContent preserves gallery video fields for YouTube entries', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flame-content-store-'));
  process.env.DATA_DIR = tempDir;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_ANON_KEY;

  delete require.cache[require.resolve('../src/storage')];
  delete require.cache[require.resolve('../src/contentStore')];

  const { createContent, getContent } = require('../src/contentStore');
  const payload = {
    id: 1000,
    title: 'YouTube gallery item',
    imageUrl: '',
    youtubeUrl: 'https://www.youtube.com/watch?v=abc123',
    thumbnailUrl: 'https://img.youtube.com/vi/abc123/hqdefault.jpg',
    mediaType: 'video'
  };

  const saved = await createContent('gallery', payload);
  const items = await getContent('gallery', []);

  assert.equal(saved.youtubeUrl, payload.youtubeUrl);
  assert.equal(saved.mediaType, 'video');
  assert.ok(items.some((item) => item.id === 1000 && item.youtubeUrl === payload.youtubeUrl));

  delete process.env.DATA_DIR;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_ANON_KEY;
  delete require.cache[require.resolve('../src/storage')];
  delete require.cache[require.resolve('../src/contentStore')];
  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('createContent classifies YouTube entries as video even when mediaType is missing', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flame-content-store-'));
  process.env.DATA_DIR = tempDir;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_ANON_KEY;

  delete require.cache[require.resolve('../src/storage')];
  delete require.cache[require.resolve('../src/contentStore')];

  const { createContent, getContent } = require('../src/contentStore');
  const payload = {
    id: 1001,
    title: 'YouTube gallery item without media type',
    imageUrl: '',
    youtubeUrl: 'https://www.youtube.com/watch?v=xyz789'
  };

  const saved = await createContent('gallery', payload);
  const items = await getContent('gallery', []);

  assert.equal(saved.mediaType, 'video');
  assert.ok(items.some((item) => item.id === 1001 && item.youtubeUrl === payload.youtubeUrl));

  delete process.env.DATA_DIR;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_ANON_KEY;
  delete require.cache[require.resolve('../src/storage')];
  delete require.cache[require.resolve('../src/contentStore')];
  fs.rmSync(tempDir, { recursive: true, force: true });
});
