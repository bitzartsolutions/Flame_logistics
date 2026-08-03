const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeImageUrl } = require('../src/imageUrls');

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
