function normalizeImageUrl(imageUrl, baseUrl) {
  if (!imageUrl) return '';

  const trimmed = String(imageUrl).trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    const normalizedBase = (baseUrl || '').replace(/\/$/, '');
    return `${normalizedBase}${trimmed}`;
  }

  return trimmed;
}

module.exports = { normalizeImageUrl };
