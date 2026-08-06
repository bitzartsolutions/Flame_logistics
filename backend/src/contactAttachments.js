const fs = require('node:fs');
const path = require('node:path');

function sanitizeFilename(name) {
  return (name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
}

function saveUploadedFiles(files, uploadsDir, publicBaseUrl) {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  return files.map((file, index) => {
    const safeName = `${Date.now()}-${index}-${sanitizeFilename(file.originalname || 'upload')}`;
    const filePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(filePath, file.buffer);

    return {
      filename: file.originalname || safeName,
      mimeType: file.mimetype || 'application/octet-stream',
      path: filePath,
      publicUrl: `${publicBaseUrl.replace(/\/$/, '')}/uploads/${safeName}`
    };
  });
}

module.exports = {
  saveUploadedFiles
};
