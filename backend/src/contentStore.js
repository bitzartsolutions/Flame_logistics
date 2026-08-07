const { getSupabaseClient } = require('./supabase');

const TABLES = {
  gallery: 'gallery_items',
  blog: 'blog_posts',
  careers: 'career_openings'
};

function normalizeRow(row) {
  if (!row) return null;
  return row;
}

async function getContent(table, fallback = []) {
  const client = getSupabaseClient();
  if (!client) {
    return fallback;
  }

  try {
    const { data, error } = await client.from(TABLES[table]).select('*').order('created_at', { ascending: false });
    if (error) {
      console.error(`Supabase read failed for ${table}`, error.message);
      return fallback;
    }

    return (data || []).map(normalizeRow);
  } catch (error) {
    console.error(`Supabase read error for ${table}`, error.message);
    return fallback;
  }
}

async function createContent(table, payload) {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  try {
    const { data, error } = await client.from(TABLES[table]).insert(payload).select().single();
    if (error) {
      console.error(`Supabase create failed for ${table}`, error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Supabase create error for ${table}`, error.message);
    return null;
  }
}

async function deleteContent(table, id) {
  const client = getSupabaseClient();
  if (!client) {
    return false;
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