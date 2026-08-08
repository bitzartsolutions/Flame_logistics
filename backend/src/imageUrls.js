function getPublicBaseUrl(req, fallbackBaseUrl = '') {
  const configuredBaseUrl = process.env.PUBLIC_BASE_URL || '';
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '');
  }

  const vercelUrl = process.env.VERCEL_URL || process.env.VERCEL_BRANCH_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '';
  if (vercelUrl) {
    const protocol = process.env.VERCEL_ENV === 'development' ? 'http' : 'https';
    return `${protocol}://${vercelUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
  }

  if (req && req.headers && req.headers.host) {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    return `${protocol}://${req.headers.host}`;
  }

  return (fallbackBaseUrl || 'http://localhost:4000').replace(/\/$/, '');
}

function normalizeImageUrl(imageUrl, baseUrl) {
  if (!imageUrl) return '';

  const trimmed = String(imageUrl).trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const normalizedBase = (baseUrl || '').replace(/\/$/, '');
    if (!normalizedBase) {
      return trimmed;
    }

    try {
      const parsedUrl = new URL(trimmed);
      const baseHost = new URL(normalizedBase);
      if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
        parsedUrl.protocol = baseHost.protocol;
        parsedUrl.hostname = baseHost.hostname;
        parsedUrl.port = '';
        parsedUrl.username = '';
        parsedUrl.password = '';
        return parsedUrl.toString();
      }
    } catch (error) {
      // Keep the original URL if it cannot be parsed.
    }

    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    const normalizedBase = (baseUrl || '').replace(/\/$/, '');
    return `${normalizedBase}${trimmed}`;
  }

  return trimmed;
}

module.exports = { normalizeImageUrl, getPublicBaseUrl };
