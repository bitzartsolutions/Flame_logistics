const fs = require('fs');
const os = require('os');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { put, head } = require('@vercel/blob');
const { normalizeImageUrl, getPublicBaseUrl } = require('./imageUrls');

function hasCloudinaryConfig() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function hasBlobConfig() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function getDataDir() {
  const configuredDir = process.env.DATA_DIR || process.env.STORAGE_DIR;
  if (configuredDir) {
    return path.resolve(configuredDir);
  }

  if (process.env.VERCEL || process.env.VERCEL_URL || process.env.VERCEL_ENV) {
    return path.join(os.tmpdir(), 'flame-logistics-data');
  }

  return path.join(__dirname, '..', 'data');
}

function ensureDataDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
  } catch (error) {
    if (error && error.code === 'EROFS') {
      const fallbackDir = path.join(os.tmpdir(), 'flame-logistics-data');
      fs.mkdirSync(fallbackDir, { recursive: true });
      return fallbackDir;
    }
    throw error;
  }
}

function getDataFile(fileName) {
  const dataDir = ensureDataDir(getDataDir());
  return path.join(dataDir, fileName);
}

const GALLERY_FILE = getDataFile('gallery.json');
const BLOG_FILE = getDataFile('blogs.json');
const JOBS_FILE = getDataFile('jobs.json');

// Initial default gallery items
const defaultGalleryItems = [
  {
    id: 1,
    category: 'transportation',
    title: 'Long-haul Desert Operations',
    subtitle: 'Fleet Excellence',
    description: 'Heavy-duty assets moving mission-critical freight across KSA corridors.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA33tyJqXpSGVg0uncV-Yxjn-nTcAj7MLpFQpcdf2R8C4TFKLNH9mlEn12DXwmPBL4Tj3sr9ci2Myanlwvdj3ipPaR93GS1pUcJTNXO1Dv9iYVT7Y670U9kDqAZDsz61UU_O7EIGoC8-vAu18XRrZ-9MwM_mmfen-NI4szscoGIuUQfqUD_ty1XMozqCOqO1Z2mE2RqdUo_Nu6-rUf0BDeztAwzbVaupAbk_SRw5rh5SjHHw-Zcjd4xVvwvRoH_R-iDMuIePHrvaHU',
    mobileAspect: 'aspect-[4/5]',
    desktopLayout: 'large',
    createdAt: new Date('2024-10-01').toISOString()
  },
  {
    id: 2,
    category: 'warehousing',
    title: 'Cold-Chain Storage Alpha',
    subtitle: 'Warehousing',
    description: 'Temperature-controlled warehousing designed for pharma-grade inventory.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBzhJc3FWikdLaIZIcNptAH66g5R2yL_O4-i21uSEDni6ngIqOWjFRYYrxStW_0PHgOJ9AiebJxHqiwN_9BxnuWZYXqWNrLF4t-S7LnfoNcAHmvnMikOdWcScpkALkQhIbgR2ElmtjKzLdS2iuoWkLbLzIQZFiNfhJh8vAURRCxN68ufzPqetkatC_uLhM6lw3V9d8nTS2vVDj3k_-jgyUIVmrs_Cv1P3YpZHSEIwF8AcdqBIs8emyrmIEWEJnRONXHXsOlowNfssg',
    mobileAspect: 'aspect-square',
    desktopLayout: 'tall',
    createdAt: new Date('2024-10-02').toISOString()
  },
  {
    id: 3,
    category: 'projects',
    title: 'Maritime Integration',
    subtitle: 'Global Network',
    description: 'Seamless land-sea handoff operations at GCC gateway ports.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDEorESN-xVdaZsxscYpfgfT0UE96vQo4oMpjKtAMmtM2KBn4ryS6IK4n-IjXVcfdDYtTBhq-bAS-04uOz4Nif9sbY6Wb8n1Tq0ZksT8UzV3g3wJJCatQBK19ZYv6t8_T7KO7NQ9y5ICzIIHHbR8_yi4oHfNzSvAm9CxOBQLlSVWyewQ7n7WdaCUSOaJ_Rjkw-UNfsFT81FHD22GAvZclBtyGeb7pWxp8z2ZR7DkguW3nBSwuz5WFBUuK48VCm4wxlmyD55TbwrPtM',
    mobileAspect: 'aspect-video',
    desktopLayout: 'wide',
    createdAt: new Date('2024-10-03').toISOString()
  },
  {
    id: 4,
    category: 'transportation',
    title: '500+ Vehicle Modern Fleet',
    subtitle: 'Fleet Showcase',
    description: 'Scalable line-haul network connecting major industrial zones.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlZq1mWUT3KlQiBw8KJqgZRgJLUj0lWdGCscJ3WluhGqPROiO2QAxI1OawSPPrV1LIX7BKkUkaRknsJd7OxiZODsN1mlmlBVSko-cD6YPIaIRgrF3ImlI4awSqa9oyhthy3w31IZacKyk4AY5gv0e7-rQkRJcAvDi3I8lUrTXqRSks4m_64oHMW5zuYZZFaTHc0kaU9wh8kob15U7N5jT7Roe_JSQZR7ESxQyGCLfpFDh0qQN4m35F',
    mobileAspect: 'aspect-[4/5]',
    desktopLayout: 'large',
    createdAt: new Date('2024-10-04').toISOString()
  },
  {
    id: 5,
    category: 'projects',
    title: 'Global Express Network',
    subtitle: 'Air Freight',
    description: 'Priority uplift services for high-value industrial cargo.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCAnSFPtc-7kA9WEBPhMAJe_zo_qWOlDHKylm6Z0fcJwMeMctoF8GJxPBSOt2R_Y0OYdtYUO7AZr__kj0Qdk_TN4n-VFQp3nzckr7alrJHvel2DytHQ_IeeMvBCEATISGybg8V2HvBJpfvxZU8IcOkcWkZZAVx55D90TqraGR9K5Jue0l4bMPD_SUHbLPW8Sv6Nw_HRYKhgS9k8yNia16rz0fy0tbu0G1MMnTgnWdvMpPhrtqHyu_ia',
    mobileAspect: 'aspect-video',
    desktopLayout: 'wide',
    createdAt: new Date('2024-10-05').toISOString()
  },
  {
    id: 6,
    category: 'pharma',
    title: 'Pharma Integrity Chain',
    subtitle: 'Pharma Chain',
    description: 'Validated cold-chain workflows for medical distribution.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC3k1VSbRS9bWNcY7JbEYqbC5IwJPjZPRk97eBlrpyOQ9RICl9Gz2BGbToRLcVZvFglcBjjviVO8Krdzb9WGLpV5wFjAhbPw1uoLyCCE9QQIZyguctigN3RJpkxHvlV1vrzKizIpdnt_6wdR1akjV8Ql4VRvyLhAk1jVV-vGHJ_BopBJMb4FR0e6iQ2O4-ovfhpy9P5j-jx-dKJ_Lf-OO1JqJ1zNoqJVEvupdAOLfVAIDVk2P5Ehgi6QgyMjS51JfDMWdCu6fDjkVo',
    mobileAspect: 'aspect-square',
    desktopLayout: 'default',
    createdAt: new Date('2024-10-06').toISOString()
  }
];

// Initial default blog posts
const defaultBlogPosts = [];

const defaultJobs = [];

function normalizeGalleryItem(item) {
  if (!item || typeof item !== 'object') {
    return item;
  }

  const youtubeUrl = (item.youtubeUrl || '').toString().trim();
  const mediaType = (item.mediaType || '').toString().trim().toLowerCase();
  const resolvedMediaType = mediaType || (youtubeUrl ? 'video' : 'image');

  return {
    ...item,
    mediaType: resolvedMediaType,
    youtubeUrl,
    thumbnailUrl: item.thumbnailUrl || item.imageUrl || ''
  };
}

function initDataStorage() {
  const dataDir = getDataDir();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const galleryFile = getDataFile('gallery.json');
  const galleryVideosFile = getDataFile('gallery-videos.json');
  const blogFile = getDataFile('blogs.json');
  const jobsFile = getDataFile('jobs.json');

  if (!fs.existsSync(galleryFile)) {
    fs.writeFileSync(galleryFile, JSON.stringify(defaultGalleryItems, null, 2));
  }

  if (!fs.existsSync(galleryVideosFile)) {
    fs.writeFileSync(galleryVideosFile, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(blogFile)) {
    fs.writeFileSync(blogFile, JSON.stringify(defaultBlogPosts, null, 2));
  }

  if (!fs.existsSync(jobsFile)) {
    fs.writeFileSync(jobsFile, JSON.stringify(defaultJobs, null, 2));
  }
}

async function readBlobJson(fileName) {
  if (!hasBlobConfig()) return null;

  try {
    const blob = await head(`data/${fileName}`, { token: process.env.BLOB_READ_WRITE_TOKEN });
    if (!blob || !blob.url) return null;

    const response = await fetch(blob.url);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn(`Unable to read ${fileName} from Vercel Blob`, error.message);
    return null;
  }
}

async function writeBlobJson(fileName, data) {
  if (!hasBlobConfig()) return false;

  try {
    const payload = JSON.stringify(data, null, 2);
    const blob = await put(`data/${fileName}`, payload, {
      access: 'public',
      contentType: 'application/json',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      overwrite: true
    });

    return Boolean(blob && blob.url);
  } catch (error) {
    console.warn(`Unable to write ${fileName} to Vercel Blob`, error.message);
    return false;
  }
}

async function readRemoteJson(fileName) {
  if (!hasCloudinaryConfig()) return null;

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const publicId = `flame-logistics-data/${fileName.replace(/\.json$/, '')}`;
    const publicUrl = cloudinary.url(publicId, { resource_type: 'raw', secure: true });
    const response = await fetch(publicUrl);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn(`Unable to read ${fileName} from Cloudinary`, error.message);
    return null;
  }
}

async function writeRemoteJson(fileName, data) {
  if (!hasCloudinaryConfig()) return false;

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const payload = JSON.stringify(data, null, 2);
    const publicId = fileName.replace(/\.json$/, '');

    await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        folder: 'flame-logistics-data',
        resource_type: 'raw',
        public_id: publicId,
        overwrite: true
      }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }).end(Buffer.from(payload, 'utf8'));
    });

    return true;
  } catch (error) {
    console.warn(`Unable to write ${fileName} to Cloudinary`, error.message);
    return false;
  }
}

async function getGallery() {
  initDataStorage();
  try {
    const blobItems = await readBlobJson('gallery.json');
    if (blobItems) {
      const baseUrl = getPublicBaseUrl(null, 'http://localhost:4000');
      return (Array.isArray(blobItems) ? blobItems : []).map((item) => normalizeGalleryItem({
        ...item,
        imageUrl: normalizeImageUrl(item && item.imageUrl ? item.imageUrl : '', baseUrl)
      }));
    }

    const remoteItems = await readRemoteJson('gallery.json');
    if (remoteItems) {
      const baseUrl = getPublicBaseUrl(null, 'http://localhost:4000');
      return (Array.isArray(remoteItems) ? remoteItems : []).map((item) => normalizeGalleryItem({
        ...item,
        imageUrl: normalizeImageUrl(item && item.imageUrl ? item.imageUrl : '', baseUrl)
      }));
    }

    const raw = fs.readFileSync(getDataFile('gallery.json'), 'utf8');
    const items = JSON.parse(raw);
    const baseUrl = getPublicBaseUrl(null, 'http://localhost:4000');
    return (Array.isArray(items) ? items : []).map((item) => normalizeGalleryItem({
      ...item,
      imageUrl: normalizeImageUrl(item && item.imageUrl ? item.imageUrl : '', baseUrl)
    }));
  } catch (err) {
    console.error('Error reading gallery file:', err);
    return defaultGalleryItems;
  }
}

async function saveGallery(items) {
  initDataStorage();
  const normalizedItems = (Array.isArray(items) ? items : []).map((item) => normalizeGalleryItem(item));
  const payload = JSON.stringify(normalizedItems, null, 2);

  if (payload.length < 8 * 1024 * 1024) {
    const blobSaved = await writeBlobJson('gallery.json', normalizedItems);
    if (blobSaved) {
      return;
    }

    const remoteSaved = await writeRemoteJson('gallery.json', normalizedItems);
    if (remoteSaved) {
      return;
    }
  }

  fs.writeFileSync(getDataFile('gallery.json'), payload);
}

async function getGalleryVideos() {
  initDataStorage();
  try {
    const blobItems = await readBlobJson('gallery-videos.json');
    if (blobItems) {
      return Array.isArray(blobItems) ? blobItems : [];
    }

    const remoteItems = await readRemoteJson('gallery-videos.json');
    if (remoteItems) {
      return Array.isArray(remoteItems) ? remoteItems : [];
    }

    const raw = fs.readFileSync(getDataFile('gallery-videos.json'), 'utf8');
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch (err) {
    console.error('Error reading gallery videos file:', err);
    return [];
  }
}

async function saveGalleryVideos(items) {
  initDataStorage();
  const payload = JSON.stringify(items, null, 2);

  const blobSaved = await writeBlobJson('gallery-videos.json', items);
  if (blobSaved) {
    return;
  }

  const remoteSaved = await writeRemoteJson('gallery-videos.json', items);
  if (remoteSaved) {
    return;
  }

  fs.writeFileSync(getDataFile('gallery-videos.json'), payload);
}

async function getBlogs() {
  initDataStorage();
  try {
    const blobPosts = await readBlobJson('blogs.json');
    if (blobPosts) {
      return blobPosts;
    }

    const remotePosts = await readRemoteJson('blogs.json');
    if (remotePosts) {
      return remotePosts;
    }

    const raw = fs.readFileSync(getDataFile('blogs.json'), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading blogs file:', err);
    return defaultBlogPosts;
  }
}

async function saveBlogs(posts) {
  initDataStorage();
  const blobSaved = await writeBlobJson('blogs.json', posts);
  if (blobSaved) {
    return;
  }

  const remoteSaved = await writeRemoteJson('blogs.json', posts);
  if (remoteSaved) {
    return;
  }
  fs.writeFileSync(getDataFile('blogs.json'), JSON.stringify(posts, null, 2));
}

async function getJobs() {
  initDataStorage();
  try {
    const blobJobs = await readBlobJson('jobs.json');
    if (blobJobs) {
      return blobJobs;
    }

    const remoteJobs = await readRemoteJson('jobs.json');
    if (remoteJobs) {
      return remoteJobs;
    }

    const raw = fs.readFileSync(getDataFile('jobs.json'), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading jobs file:', err);
    return defaultJobs;
  }
}

async function saveJobs(jobs) {
  initDataStorage();
  const blobSaved = await writeBlobJson('jobs.json', jobs);
  if (blobSaved) {
    return;
  }

  const remoteSaved = await writeRemoteJson('jobs.json', jobs);
  if (remoteSaved) {
    return;
  }
  fs.writeFileSync(getDataFile('jobs.json'), JSON.stringify(jobs, null, 2));
}

module.exports = {
  getGallery,
  saveGallery,
  getGalleryVideos,
  saveGalleryVideos,
  getBlogs,
  saveBlogs,
  getJobs,
  saveJobs
};
