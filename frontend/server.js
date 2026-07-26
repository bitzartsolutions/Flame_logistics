const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const PAGES_DIR = path.join(__dirname, 'pages');
const DESKTOP_DIR = path.join(PAGES_DIR, 'desktop');
const MOBILE_DIR = path.join(PAGES_DIR, 'mobile');

// Serve static files from frontend directory
app.use(express.static(__dirname));

// Route root / to index.html (viewport detector)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route /admin to admin.html
app.get(['/admin', '/admin.html'], (req, res) => {
  res.sendFile(path.join(PAGES_DIR, 'admin.html'));
});

// Handle page routes - redirect to index.html with page parameter
// This allows client-side viewport detection to work
app.get('/:page', (req, res, next) => {
  let pageName = req.params.page;
  
  // Skip if it's a file request (has extension other than .html)
  if (pageName.includes('.') && !pageName.endsWith('.html')) {
    return next();
  }
  
  // Remove .html extension if present
  if (pageName.endsWith('.html')) {
    pageName = pageName.slice(0, -5);
  }
  
  // Check if page exists in either mobile or desktop
  const desktopExists = fs.existsSync(path.join(DESKTOP_DIR, pageName + '.html'));
  const mobileExists = fs.existsSync(path.join(MOBILE_DIR, pageName + '.html'));
  
  if (desktopExists || mobileExists) {
    // Redirect to index.html with page parameter for client-side detection
    return res.redirect(`/?page=${pageName}`);
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
  console.log(`\nViewport Detection: Client-side (works with DevTools)`);
  console.log(`Breakpoint: 768px`);
  console.log(`\nHow it works:`);
  console.log(`  1. Visit http://localhost:${PORT}`);
  console.log(`  2. Client detects viewport width`);
  console.log(`  3. Redirects to /pages/mobile/ or /pages/desktop/`);
  console.log(`\nDirect access:`);
  console.log(`  Mobile:  http://localhost:${PORT}/pages/mobile/about.html`);
  console.log(`  Desktop: http://localhost:${PORT}/pages/desktop/about.html`);
  console.log(`\nAvailable pages:`);
  console.log(`  - Home, About, Services, Industries`);
  console.log(`  - Gallery, Blog, Contact, Admin`);
  console.log(`========================================\n`);
});
