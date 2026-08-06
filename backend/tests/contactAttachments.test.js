const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const { saveUploadedFiles } = require('../src/contactAttachments');

test('saveUploadedFiles stores uploaded documents and returns metadata', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flame-contact-'));
  const fileBuffer = Buffer.from('manifest content', 'utf8');

  const files = [
    {
      originalname: 'manifest.pdf',
      mimetype: 'application/pdf',
      buffer: fileBuffer
    }
  ];

  const saved = saveUploadedFiles(files, tempDir, 'http://localhost:4000');

  assert.equal(saved.length, 1);
  assert.equal(saved[0].filename, 'manifest.pdf');
  assert.equal(saved[0].mimeType, 'application/pdf');
  assert.equal(fs.existsSync(saved[0].path), true);
  assert.equal(fs.readFileSync(saved[0].path, 'utf8'), 'manifest content');

  fs.rmSync(tempDir, { recursive: true, force: true });
});
