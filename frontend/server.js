const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || process.env.BACKEND_BASE_URL || 'http://127.0.0.1:4000';

const PAGES_DIR = path.join(__dirname, 'pages');
const DESKTOP_DIR = path.join(PAGES_DIR, 'desktop');
const MOBILE_DIR = path.join(PAGES_DIR, 'mobile');

// Proxy API requests to the backend so the pages can use /api consistently.
app.use('/api', (req, res) => {
  const target = new URL(BACKEND_URL);
  const proxyReq = http.request({
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port,
    path: req.originalUrl,
    method: req.method,
    headers: {
      ...req.headers,
      host: target.host
    }
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (error) => {
    console.error('API proxy error:', error.message);
    res.status(502).json({ error: 'Backend unavailable', detail: error.message });
  });

  req.pipe(proxyReq, { end: true });
});

app.get('/health', (req, res) => {
  const target = new URL(BACKEND_URL);
  const proxyReq = http.request({
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port,
    path: '/health',
    method: 'GET',
    headers: { host: target.host }
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (error) => {
    console.error('Health proxy error:', error.message);
    res.status(502).json({ error: 'Backend unavailable', detail: error.message });
  });

  proxyReq.end();
});

// Redirect any trailing-slash URL (e.g. /services/) to its slash-less form
// (/services). Without this, Express's default non-strict routing silently
// serves both as identical, and a relative link like href="solutions" then
// resolves against the trailing slash into a broken /services/solutions
// instead of /solutions.
app.use((req, res, next) => {
  if (req.path !== '/' && req.path.endsWith('/')) {
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    return res.redirect(301, req.path.slice(0, -1) + query);
  }
  next();
});

// Serve static files from frontend directory (index:false so our own "/" route below
// decides what to send, instead of express.static auto-serving index.html)
app.use(express.static(__dirname, { index: false }));

// Detect mobile devices via User-Agent, mirroring the site's existing 768px
// viewport breakpoint used by the client-side detector in index.html.
function isMobileRequest(req) {
  const ua = req.headers['user-agent'] || '';
  return /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Mobile(?!.*iPad)/i.test(ua);
}

// Resolve a page name (no extension) to an actual file on disk, preferring the
// device-appropriate folder and falling back to the other if only one exists.
function resolvePageFile(pageName, isMobile) {
  const primaryDir = isMobile ? MOBILE_DIR : DESKTOP_DIR;
  const fallbackDir = isMobile ? DESKTOP_DIR : MOBILE_DIR;

  const primaryPath = path.join(primaryDir, pageName + '.html');
  if (fs.existsSync(primaryPath)) return primaryPath;

  const fallbackPath = path.join(fallbackDir, pageName + '.html');
  if (fs.existsSync(fallbackPath)) return fallbackPath;

  return null;
}

// Route root / directly to the home page content (served in place, so the
// address bar keeps showing "/" instead of "/pages/desktop/home.html").
app.get('/', (req, res) => {
  const filePath = resolvePageFile('home', isMobileRequest(req));
  if (filePath) return res.sendFile(filePath);
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route /admin to admin.html
app.get(['/admin', '/admin.html'], (req, res) => {
  res.sendFile(path.join(PAGES_DIR, 'admin.html'));
});

// Clean page routes: /home, /services, /job-detail.html?id=5, etc.
// Serves the matching desktop/mobile file's content directly at this URL
// (no redirect), so the address bar never reveals the /pages/desktop/ or
// /pages/mobile/ folder structure.
app.get('/:page', (req, res, next) => {
  let pageName = req.params.page;

  // Skip if it's a file request (has extension other than .html) so real
  // static assets (favicon.ico, robots.txt, etc.) fall through normally.
  if (pageName.includes('.') && !pageName.endsWith('.html')) {
    return next();
  }

  if (pageName.endsWith('.html')) {
    pageName = pageName.slice(0, -5);
  }

  const filePath = resolvePageFile(pageName, isMobileRequest(req));
  if (filePath) {
    return res.sendFile(filePath);
  }

  next();
});

// Direct access to pages folder (for after redirect)
app.get('/pages/:type/:page', (req, res, next) => {
  const { type, page } = req.params;
  
  if (type !== 'mobile' && type !== 'desktop') {
    return next();
  }
  
  let pageName = page;
  if (!pageName.endsWith('.html')) {
    pageName += '.html';
  }
  
  const pagePath = path.join(PAGES_DIR, type, pageName);
  
  if (fs.existsSync(pagePath)) {
    console.log(`[${new Date().toLocaleTimeString()}] Serving ${type}/${pageName}`);
    return res.sendFile(pagePath);
  }
  
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>404 - Page Not Found</title>
      <style>
        body { font-family: system-ui; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #151719; color: #fff; }
        .container { text-align: center; }
        h1 { color: #bc000c; }
        a { color: #bc000c; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>404</h1>
        <p>Page not found</p>
        <a href="/">Go to Home</a>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  Flame Logistics Frontend Server`);
  console.log(`========================================`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`\nViewport Detection: Server-side User-Agent sniffing`);
  console.log(`\nHow it works:`);
  console.log(`  1. Visit http://localhost:${PORT}/home (or any clean page URL)`);
  console.log(`  2. Server detects device type from the request's User-Agent`);
  console.log(`  3. Serves the matching pages/mobile/ or pages/desktop/ file`);
  console.log(`     directly, so the URL stays clean (no /pages/... prefix)`);
  console.log(`\nDirect access (still works, unchanged):`);
  console.log(`  Mobile:  http://localhost:${PORT}/pages/mobile/about.html`);
  console.log(`  Desktop: http://localhost:${PORT}/pages/desktop/about.html`);
  console.log(`\nAvailable pages:`);
  console.log(`  - Home, About, Services, Industries`);
  console.log(`  - Gallery, Blog, Contact, Admin`);
  console.log(`========================================\n`);
});
