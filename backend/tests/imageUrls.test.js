const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeImageUrl, getPublicBaseUrl } = require('../src/imageUrls');

test('keeps absolute http URLs unchanged', () => {
  assert.equal(normalizeImageUrl('https://cdn.example.com/a.png', 'http://localhost:4000'), 'https://cdn.example.com/a.png');
});

test('keeps data URLs unchanged', () => {
  const dataUrl = 'data:image/png;base64,abc123';
  assert.equal(normalizeImageUrl(dataUrl, 'http://localhost:4000'), dataUrl);
});

test('turns local upload paths into absolute URLs', () => {
  assert.equal(normalizeImageUrl('/uploads/test.png', 'http://localhost:4000'), 'http://localhost:4000/uploads/test.png');
});

test('prefers Vercel hostnames for public URLs', () => {
  const previous = process.env.VERCEL_URL;
  const previousBase = process.env.PUBLIC_BASE_URL;
  delete process.env.PUBLIC_BASE_URL;
  process.env.VERCEL_URL = 'flame-logistics-backend.vercel.app';

  try {
    assert.equal(getPublicBaseUrl({}, 'http://localhost:4000'), 'https://flame-logistics-backend.vercel.app');
  } finally {
    if (previousBase === undefined) {
      delete process.env.PUBLIC_BASE_URL;
    } else {
      process.env.PUBLIC_BASE_URL = previousBase;
    }

    if (previous === undefined) {
      delete process.env.VERCEL_URL;
    } else {
      process.env.VERCEL_URL = previous;
    }
  }
});
