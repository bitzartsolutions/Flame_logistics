const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');

const galleryRoutes = require('../routes/galleryRoutes');
const blogRoutes = require('../routes/blogRoutes');
const careersRoutes = require('../routes/careersRoutes');
const { normalizeImageUrl } = require('./imageUrls');
const { saveUploadedFiles } = require('./contactAttachments');

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
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'info@flamelogistics.net';
const SMTP_FROM = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@flamelogistics.net';

function createMailTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

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
      cb(null, true);
    }
  }
});

const contactUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
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

app.post('/api/contact', contactUpload.array('attachments', 5), async (req, res) => {
  try {
    const body = req.body || {};
    const fullName = body.fullName || body.name || body.full_name || '';
    const email = body.email || body.emailAddress || '';
    const companyName = body.companyName || body.company || '';
    const phone = body.phone || body.phoneNumber || '';
    const country = body.country || '';
    const service = body.service || body.serviceRequired || '';
    const message = body.message || '';
    const page = body.page || 'website';

    if (!fullName || !email || !message) {
      return res.status(400).json({ error: 'Please provide your full name, email address, and message.' });
    }

    const savedFiles = saveUploadedFiles(req.files || [], UPLOADS_DIR, process.env.PUBLIC_BASE_URL || 'http://localhost:4000');
    const transporter = createMailTransporter();
    if (!transporter) {
      console.error('SMTP configuration missing. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env');
      return res.status(500).json({ error: 'Mail service is not configured yet.' });
    }

    const attachments = savedFiles.map((file) => ({
      filename: file.filename,
      contentType: file.mimeType,
      path: file.path
    }));

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: RECIPIENT_EMAIL,
      replyTo: email,
      subject: `New inquiry from ${fullName}`,
      html: `
        <h3>New inquiry from Flame Logistics website</h3>
        <p><strong>Page:</strong> ${page}</p>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${companyName || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Country:</strong> ${country || 'Not provided'}</p>
        <p><strong>Service:</strong> ${service || 'Not provided'}</p>
        <p><strong>Message:</strong><br/>${message}</p>
        ${savedFiles.length ? `<p><strong>Attachments:</strong> ${savedFiles.map((file) => file.filename).join(', ')}</p>` : ''}
      `,
      attachments
    });

    res.json({ success: true, message: 'Your inquiry was sent successfully.', messageId: info.messageId });
  } catch (error) {
    console.error('Error sending inquiry email:', error);

    const responseText = error.response || error.message || '';
    const isUnauthorizedIp = error.code === 'EAUTH' && /unauthorized ip/i.test(responseText);

    if (isUnauthorizedIp) {
      return res.status(502).json({
        error: 'SMTP provider rejected this server IP.',
        detail: 'Add this server IP to your SMTP provider allowlist or switch to a provider that accepts requests from this environment.'
      });
    }

    res.status(500).json({ error: 'Failed to send inquiry email.', detail: error.message });
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

  if (req.path === '/upload' || req.path === '/gallery' || req.path.startsWith('/gallery/') || req.path === '/blog' || req.path.startsWith('/blog/') || req.path === '/careers' || req.path.startsWith('/careers/')) {
    return next();
  }

  const token = getAuthToken(req);

  if (token && (adminSessions.has(token) || verifyAdminToken(token))) {
    return next();
  }

  if (req.method === 'GET' && (req.path === '/gallery' || req.path === '/blog' || req.path === '/careers')) {
    return next();
  }

  if (req.method === 'POST' && (req.path === '/gallery' || req.path === '/blog' || req.path === '/careers' || req.path === '/careers/apply' || req.path === '/upload' || req.path === '/contact')) {
    return next();
  }

  if (req.method === 'DELETE' && (req.path === '/gallery' || req.path.startsWith('/gallery/') || req.path === '/blog' || req.path.startsWith('/blog/') || req.path === '/careers' || req.path.startsWith('/careers/'))) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized', detail: `Method ${req.method} path ${req.path} not allowed` });
});

// Register API Routes
app.use('/api/gallery', galleryRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/careers', careersRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'flame-logistics-backend' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
