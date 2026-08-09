const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { sanitizePayloadForTable, normalizeSupabaseRowForApp } = require('../src/contentStore');

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

test('createContent falls back to local storage when Supabase write fails', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flame-content-store-'));
  process.env.DATA_DIR = tempDir;
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

  const fakeClient = {
    from() {
      return {
        insert() {
          return {
            select() {
              return {
                single: async () => ({ data: null, error: { message: 'insert failed' } })
              };
            }
          };
        }
      };
    }
  };

  const Module = require('module');
  const originalLoad = Module._load;
  Module._load = function(request, parent, isMain) {
    if (request === './supabase') {
      return { getSupabaseClient: () => fakeClient };
    }
    return originalLoad.apply(this, arguments);
  };

  delete require.cache[require.resolve('../src/storage')];
  delete require.cache[require.resolve('../src/contentStore')];

  try {
    const { createContent, getContent } = require('../src/contentStore');
    const payload = { id: 2001, title: 'Supabase write failure', imageUrl: 'https://example.com/should-not-save.jpg' };

    const saved = await createContent('gallery', payload);
    const items = await getContent('gallery', []);

    assert.equal(saved.title, 'Supabase write failure');
    assert.ok(items.some((item) => item.id === 2001));
    assert.equal(fs.existsSync(path.join(tempDir, 'gallery.json')), true);
  } finally {
    Module._load = originalLoad;
    delete process.env.DATA_DIR;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
    delete require.cache[require.resolve('../src/storage')];
    delete require.cache[require.resolve('../src/contentStore')];
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('createContent sends careers data using a schema-safe column name', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flame-content-store-'));
  process.env.DATA_DIR = tempDir;
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

  const insertedPayloads = [];
  const fakeClient = {
    from(table) {
      return {
        insert(payload) {
          insertedPayloads.push({ table, payload });
          return {
            select() {
              return {
                single: async () => ({ data: { id: 1, ...payload }, error: null })
              };
            }
          };
        }
      };
    }
  };

  const Module = require('module');
  const originalLoad = Module._load;
  Module._load = function(request, parent, isMain) {
    if (request === './supabase') {
      return { getSupabaseClient: () => fakeClient };
    }
    return originalLoad.apply(this, arguments);
  };

  delete require.cache[require.resolve('../src/storage')];
  delete require.cache[require.resolve('../src/contentStore')];

  try {
    const { createContent } = require('../src/contentStore');
    await createContent('careers', {
      id: 10,
      title: 'Operations Lead',
      department: 'Operations',
      location: 'Riyadh',
      jobType: 'Full Time',
      experience: '3+ years',
      salary: 'Competitive',
      description: 'Lead operations',
      requirements: ['Leadership'],
      deadline: '2026-12-31',
      active: true,
      created_at: '2026-08-08T00:00:00.000Z'
    });

    assert.equal(insertedPayloads.length, 1);
    assert.equal(insertedPayloads[0].table, 'career_openings');
    assert.equal(insertedPayloads[0].payload.jobType, 'Full Time');
    assert.equal(insertedPayloads[0].payload.job_type, undefined);
  } finally {
    Module._load = originalLoad;
    delete process.env.DATA_DIR;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
    delete require.cache[require.resolve('../src/storage')];
    delete require.cache[require.resolve('../src/contentStore')];
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('sanitizePayloadForTable maps gallery fields to Supabase-friendly snake_case keys', () => {
  const payload = {
    title: 'YouTube gallery item',
    imageUrl: 'https://example.com/cover.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=abc123',
    thumbnailUrl: 'https://img.youtube.com/vi/abc123/hqdefault.jpg',
    mediaType: 'video'
  };

  const sanitized = sanitizePayloadForTable('gallery', payload);

  assert.equal(sanitized.title, 'YouTube gallery item');
  assert.equal(sanitized.imageUrl, 'https://example.com/cover.jpg');
  assert.equal(sanitized.youtubeUrl, 'https://www.youtube.com/watch?v=abc123');
  assert.equal(sanitized.thumbnailUrl, 'https://img.youtube.com/vi/abc123/hqdefault.jpg');
  assert.equal(sanitized.mediaType, 'video');
});

test('normalizeSupabaseRowForApp converts snake_case fields back to camelCase', () => {
  const row = {
    id: 7,
    title: 'Video title',
    image_url: 'https://example.com/cover.jpg',
    youtube_url: 'https://www.youtube.com/watch?v=abc123',
    thumbnail_url: 'https://img.youtube.com/vi/abc123/hqdefault.jpg',
    media_type: 'video',
    mobile_aspect: 'aspect-square',
    desktop_layout: 'wide',
    created_at: '2026-08-08T00:00:00.000Z'
  };

  const normalized = normalizeSupabaseRowForApp('gallery', row);

  assert.equal(normalized.imageUrl, 'https://example.com/cover.jpg');
  assert.equal(normalized.youtubeUrl, 'https://www.youtube.com/watch?v=abc123');
  assert.equal(normalized.thumbnailUrl, 'https://img.youtube.com/vi/abc123/hqdefault.jpg');
  assert.equal(normalized.mediaType, 'video');
  assert.equal(normalized.mobileAspect, 'aspect-square');
  assert.equal(normalized.desktopLayout, 'wide');
  assert.equal(normalized.created_at, '2026-08-08T00:00:00.000Z');
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
