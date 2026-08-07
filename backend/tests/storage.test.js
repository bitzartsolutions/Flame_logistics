const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('saveGallery writes to a configured data directory', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flame-storage-'));
  process.env.DATA_DIR = tempDir;
  delete require.cache[require.resolve('../src/storage')];

  const { saveGallery, getGallery } = require('../src/storage');
  const payload = [{ id: 1, title: 'Demo', imageUrl: 'https://example.com/demo.jpg' }];

  saveGallery(payload);
  const items = getGallery();

  assert.equal(items[0].title, 'Demo');
  assert.equal(fs.existsSync(path.join(tempDir, 'gallery.json')), true);

  delete process.env.DATA_DIR;
  delete require.cache[require.resolve('../src/storage')];
  fs.rmSync(tempDir, { recursive: true, force: true });
});
