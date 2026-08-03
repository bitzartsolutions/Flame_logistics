const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const galleryRoutes = require('../routes/galleryRoutes');
const blogRoutes = require('../routes/blogRoutes');
const { normalizeImageUrl } = require('./imageUrls');

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;

  const contents = fs.readFileSync(envPath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key) {
      process.env[key] = value.replace(/^['"]|['"]$/g, '');
    }
  });
}

loadEnvFile(path.join(__dirname, '..', '.env'));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT || 4000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';
const adminSessions = new Map();
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

function createAdminToken(username) {
  const header = Buffer.from(JSON.stringify({ username, issuedAt: Date.now() })).toString('base64url');
  const signature = crypto.createHmac('sha256', ADMIN_PASSWORD).update(header).digest('base64url');
  return `${header}.${signature}`;
}

function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return false;

  const [header, signature] = token.split('.');
  if (!header || !signature) return false;

  const expected = crypto.createHmac('sha256', ADMIN_PASSWORD).update(header).digest('base64url');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch (error) {
    return false;
  }
}

function getAuthToken(req) {
  const authHeader = req.headers.authorization || '';
  if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }

  const xAdminToken = req.headers['x-admin-token'] || req.headers['X-Admin-Token'] || '';
  if (typeof xAdminToken === 'string' && xAdminToken.trim()) {
    return xAdminToken.trim();
  }

  return '';
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Image Upload API Endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const publicBaseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:4000';

    const saveLocally = () => {
      const safeName = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const filePath = path.join(UPLOADS_DIR, safeName);
      fs.writeFileSync(filePath, req.file.buffer);
      return normalizeImageUrl(`/uploads/${safeName}`, publicBaseUrl);
    };

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      const publicUrl = saveLocally();
      return res.json({
        message: 'Image uploaded successfully',
        imageUrl: publicUrl,
        filename: req.file.originalname
      });
    }

    try {
      const result = await cloudinary.uploader.upload_stream({
        folder: 'flame-logistics',
        resource_type: 'image'
      }).end(req.file.buffer);

      const publicUrl = normalizeImageUrl(result.secure_url || result.url, publicBaseUrl);

      res.json({
        message: 'Image uploaded successfully',
        imageUrl: publicUrl,
        filename: req.file.originalname
      });
    } catch (cloudinaryError) {
      console.warn('Cloudinary upload failed, using local fallback.', cloudinaryError.message);
      const publicUrl = saveLocally();
      res.json({
        message: 'Image uploaded successfully',
        imageUrl: publicUrl,
        filename: req.file.originalname
      });
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = createAdminToken(username);
    adminSessions.set(token, { username });
    return res.json({ success: true, token, username });
  }

  return res.status(401).json({ error: 'Invalid username or password' });
});

app.use('/api', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token');
    return res.sendStatus(204);
  }

  if (req.path === '/admin/login') {
    return next();
  }

  if (req.path === '/upload' || req.path === '/gallery' || req.path.startsWith('/gallery/') || req.path === '/blog' || req.path.startsWith('/blog/')) {
    return next();
  }

  const token = getAuthToken(req);

  if (token && (adminSessions.has(token) || verifyAdminToken(token))) {
    return next();
  }

  if (req.method === 'GET' && (req.path === '/gallery' || req.path === '/blog')) {
    return next();
  }

  if (req.method === 'POST' && (req.path === '/gallery' || req.path === '/blog' || req.path === '/upload')) {
    return next();
  }

  if (req.method === 'DELETE' && (req.path === '/gallery' || req.path.startsWith('/gallery/') || req.path === '/blog' || req.path.startsWith('/blog/'))) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized', detail: `Method ${req.method} path ${req.path} not allowed` });
});

// Register API Routes
app.use('/api/gallery', galleryRoutes);
app.use('/api/blog', blogRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'flame-logistics-backend' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
