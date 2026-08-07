const fs = require('fs');
const path = require('path');
const os = require('os');
const { getSupabaseClient } = require('./supabase');

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

function normalizeRow(row) {
  if (!row) return null;
  return row;
}

async function getContent(table, fallback = []) {
  const client = getSupabaseClient();
  if (!client) {
    return getLocalTableData(table, fallback);
  }

  try {
    const { data, error } = await client.from(TABLES[table]).select('*').order('created_at', { ascending: false });
    if (error) {
      console.error(`Supabase read failed for ${table}`, error.message);
      return getLocalTableData(table, fallback);
    }

    return (data || []).map(normalizeRow);
  } catch (error) {
    console.error(`Supabase read error for ${table}`, error.message);
    return getLocalTableData(table, fallback);
  }
}

async function createContent(table, payload) {
  const client = getSupabaseClient();
  if (!client) {
    const items = getLocalTableData(table, []);
    const nextPayload = { ...payload, created_at: payload.created_at || new Date().toISOString() };
    items.push(nextPayload);
    const saved = saveLocalTableData(table, items);
    return saved ? nextPayload : null;
  }

  try {
    const { data, error } = await client.from(TABLES[table]).insert(payload).select().single();
    if (error) {
      console.error(`Supabase create failed for ${table}`, error.message);
      const items = getLocalTableData(table, []);
      const nextPayload = { ...payload, created_at: payload.created_at || new Date().toISOString() };
      items.push(nextPayload);
      const saved = saveLocalTableData(table, items);
      return saved ? nextPayload : null;
    }

    return data;
  } catch (error) {
    console.error(`Supabase create error for ${table}`, error.message);
    const items = getLocalTableData(table, []);
    const nextPayload = { ...payload, created_at: payload.created_at || new Date().toISOString() };
    items.push(nextPayload);
    const saved = saveLocalTableData(table, items);
    return saved ? nextPayload : null;
  }
}

async function deleteContent(table, id) {
  const client = getSupabaseClient();
  if (!client) {
    const items = getLocalTableData(table, []);
    const filteredItems = items.filter((item) => Number(item.id) !== Number(id));
    saveLocalTableData(table, filteredItems);
    return filteredItems.length !== items.length;
  }

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

module.exports = {
  getContent,
  createContent,
  deleteContent
};