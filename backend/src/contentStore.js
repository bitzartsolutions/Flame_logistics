const fs = require('fs');
const path = require('path');
const os = require('os');
const { getSupabaseClient } = require('./supabase');
const { getGallery, saveGallery, getBlogs, saveBlogs, getJobs, saveJobs } = require('./storage');

const TABLES = {
  gallery: 'gallery_items',
  blog: 'blog_posts',
  careers: 'career_openings'
};

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

function readLocalJson(fileName, fallback = []) {
  try {
    const filePath = getDataFile(fileName);
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Unable to read local ${fileName}`, error.message);
    return fallback;
  }
}

function writeLocalJson(fileName, data) {
  try {
    const filePath = getDataFile(fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.warn(`Unable to write local ${fileName}`, error.message);
    return false;
  }
}

function getLocalFileName(table) {
  const mapping = {
    gallery: 'gallery.json',
    blog: 'blogs.json',
    careers: 'jobs.json'
  };

  return mapping[table] || `${table}.json`;
}

function getLocalTableData(table, fallback = []) {
  const fileName = getLocalFileName(table);
  const data = readLocalJson(fileName, fallback);
  return Array.isArray(data) ? data : fallback;
}

function saveLocalTableData(table, data) {
  const fileName = getLocalFileName(table);
  return writeLocalJson(fileName, data);
}

function normalizeGalleryRow(row) {
  if (!row || typeof row !== 'object') {
    return row;
  }

  const youtubeUrl = (row.youtubeUrl || '').toString().trim();
  const mediaType = (row.mediaType || '').toString().trim().toLowerCase();
  const resolvedMediaType = mediaType || (youtubeUrl ? 'video' : 'image');

  return {
    ...row,
    mediaType: resolvedMediaType,
    youtubeUrl,
    thumbnailUrl: row.thumbnailUrl || row.imageUrl || ''
  };
}

function normalizeRow(row) {
  if (!row) return null;
  if (row && typeof row === 'object' && row.youtubeUrl) {
    return normalizeGalleryRow(row);
  }
  return row;
}

const SUPABASE_COLUMN_MAP = {
  gallery: {
    id: 'id',
    title: 'title',
    subtitle: 'subtitle',
    description: 'description',
    category: 'category',
    imageUrl: 'image_url',
    youtubeUrl: 'youtube_url',
    thumbnailUrl: 'thumbnail_url',
    mediaType: 'media_type',
    mobileAspect: 'mobile_aspect',
    desktopLayout: 'desktop_layout',
    created_at: 'created_at'
  },
  blog: {
    id: 'id',
    title: 'title',
    content: 'content',
    excerpt: 'excerpt',
    category: 'category',
    imageUrl: 'image_url',
    date: 'date',
    readTime: 'read_time',
    featured: 'featured',
    created_at: 'created_at'
  },
  careers: {
    id: 'id',
    title: 'title',
    department: 'department',
    location: 'location',
    jobType: 'job_type',
    experience: 'experience',
    salary: 'salary',
    requirements: 'requirements',
    deadline: 'deadline',
    active: 'active',
    created_at: 'created_at'
  }
};

function preparePayloadForSupabase(table, payload) {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const columnMap = SUPABASE_COLUMN_MAP[table] || {};
  const mappedPayload = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    const mappedKey = columnMap[key] || key;
    mappedPayload[mappedKey] = value;
  });

  return mappedPayload;
}

function normalizeSupabaseRowForApp(table, row) {
  if (!row || typeof row !== 'object') {
    return row;
  }

  const columnMap = SUPABASE_COLUMN_MAP[table] || {};
  const inverseMap = Object.entries(columnMap).reduce((acc, [camelKey, snakeKey]) => {
    if (snakeKey && snakeKey !== camelKey) {
      acc[snakeKey] = camelKey;
    }
    return acc;
  }, {});

  const normalized = {};
  Object.entries(row).forEach(([key, value]) => {
    const mappedKey = inverseMap[key] || key;
    normalized[mappedKey] = value;
  });

  return normalized;
}

function sanitizePayloadForTable(table, payload) {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const allowedColumns = {
    gallery: ['id', 'title', 'subtitle', 'description', 'category', 'imageUrl', 'youtubeUrl', 'thumbnailUrl', 'mediaType', 'mobileAspect', 'desktopLayout', 'created_at'],
    blog: ['id', 'title', 'content', 'excerpt', 'category', 'imageUrl', 'date', 'readTime', 'featured', 'created_at'],
    careers: ['id', 'title', 'department', 'location', 'jobType', 'experience', 'salary', 'requirements', 'deadline', 'active', 'created_at']
  };

  const columns = allowedColumns[table];
  if (!columns) {
    return payload;
  }

  const sanitizedPayload = {};
  columns.forEach((column) => {
    if (payload[column] !== undefined) {
      sanitizedPayload[column] = payload[column];
    }
  });

  if (table === 'gallery') {
    const normalized = normalizeGalleryRow(sanitizedPayload);
    if (normalized.youtubeUrl) {
      normalized.mediaType = 'video';
    }
    return normalized;
  }

  if (payload.created_at !== undefined && sanitizedPayload.created_at === undefined) {
    sanitizedPayload.created_at = payload.created_at;
  }

  return sanitizedPayload;
}

function getStorageAdapter(table) {
  switch (table) {
    case 'gallery':
      return { get: getGallery, save: saveGallery };
    case 'blog':
      return { get: getBlogs, save: saveBlogs };
    case 'careers':
      return { get: getJobs, save: saveJobs };
    default:
      return null;
  }
}

function shouldUseSupabase(table) {
  return Boolean(getSupabaseClient());
}

function getSupabasePayload(table, payload) {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const safePayload = sanitizePayloadForTable(table, payload);
  return safePayload;
}

async function getContent(table, fallback = []) {
  const client = shouldUseSupabase(table) ? getSupabaseClient() : null;
  if (client) {
    try {
      const { data, error } = await client.from(TABLES[table]).select('*').order('created_at', { ascending: false });
      if (error) {
        console.error(`Supabase read failed for ${table}`, error.message);
      } else {
        return (data || []).map((row) => normalizeRow(normalizeSupabaseRowForApp(table, row)));
      }
    } catch (error) {
      console.error(`Supabase read error for ${table}`, error.message);
    }
  }

  const adapter = getStorageAdapter(table);
  if (adapter) {
    try {
      const data = await adapter.get();
      if (Array.isArray(data)) {
        return data;
      }
    } catch (error) {
      console.warn(`Storage adapter read failed for ${table}`, error.message);
    }
  }

  return getLocalTableData(table, fallback);
}

async function createContent(table, payload) {
  const safePayload = sanitizePayloadForTable(table, payload);
  const client = shouldUseSupabase(table) ? getSupabaseClient() : null;
  if (client) {
    try {
      const supabasePayload = preparePayloadForSupabase(table, safePayload);
      const { data, error } = await client.from(TABLES[table]).insert(supabasePayload).select().single();
      if (error) {
        console.error(`Supabase create failed for ${table}`, error.message);
        return null;
      }

      return normalizeSupabaseRowForApp(table, data);
    } catch (error) {
      console.error(`Supabase create error for ${table}`, error.message);
      return null;
    }
  }

  const adapter = getStorageAdapter(table);
  if (adapter) {
    try {
      const items = await adapter.get();
      const nextPayload = { ...safePayload, created_at: safePayload.created_at || new Date().toISOString() };
      const nextItems = Array.isArray(items) ? [...items, nextPayload] : [nextPayload];
      await adapter.save(nextItems);
      return nextPayload;
    } catch (error) {
      console.warn(`Storage adapter write failed for ${table}`, error.message);
    }
  }

  const items = getLocalTableData(table, []);
  const nextPayload = { ...safePayload, created_at: safePayload.created_at || new Date().toISOString() };
  items.push(nextPayload);
  const saved = saveLocalTableData(table, items);
  return saved ? nextPayload : null;
}

async function deleteContent(table, id) {
  const client = shouldUseSupabase(table) ? getSupabaseClient() : null;
  if (client) {
    try {
      const { error } = await client.from(TABLES[table]).delete().eq('id', id);
      if (error) {
        console.error(`Supabase delete failed for ${table}`, error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Supabase delete error for ${table}`, error.message);
      return false;
    }
  }

  const adapter = getStorageAdapter(table);
  if (adapter) {
    try {
      const items = await adapter.get();
      const filteredItems = Array.isArray(items) ? items.filter((item) => Number(item.id) !== Number(id)) : [];
      await adapter.save(filteredItems);
      return filteredItems.length !== (Array.isArray(items) ? items.length : 0);
    } catch (error) {
      console.warn(`Storage adapter delete failed for ${table}`, error.message);
    }
  }

  const items = getLocalTableData(table, []);
  const filteredItems = items.filter((item) => Number(item.id) !== Number(id));
  saveLocalTableData(table, filteredItems);
  return filteredItems.length !== items.length;
}

module.exports = {
  getContent,
  createContent,
  deleteContent,
  sanitizePayloadForTable,
  normalizeSupabaseRowForApp
};