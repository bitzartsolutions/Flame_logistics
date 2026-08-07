const express = require('express');
const router = express.Router();
const { getBlogs, saveBlogs } = require('../src/storage');
const { normalizeImageUrl, getPublicBaseUrl } = require('../src/imageUrls');

function getBaseUrl(req) {
  return getPublicBaseUrl(req, 'http://localhost:4000');
}

function normalizeBlogPost(post, req) {
  if (!post) return null;

  return {
    ...post,
    imageUrl: normalizeImageUrl(post.imageUrl, getBaseUrl(req))
  };
}

function normalizeBlogPosts(posts, req) {
  return (posts || []).map((post) => normalizeBlogPost(post, req)).filter(Boolean);
}

// GET /api/blog
router.get('/', async (req, res) => {
  try {
    const category = (req.query.category || 'all').toString().toLowerCase();
    const q = (req.query.q || '').toString().toLowerCase().trim();
    const limit = Number(req.query.limit || 0);

    let posts = normalizeBlogPosts(await getBlogs(), req);

    if (category !== 'all') {
      posts = posts.filter((post) => (post.category || '').toLowerCase() === category);
    }

    if (q) {
      posts = posts.filter(
        (post) =>
          (post.title || '').toLowerCase().includes(q) ||
          (post.excerpt || '').toLowerCase().includes(q) ||
          (post.category || '').toLowerCase().includes(q) ||
          (post.content || '').toLowerCase().includes(q)
      );
    }

    if (limit > 0) {
      posts = posts.slice(0, limit);
    }

    const featured = posts.find((post) => post.featured) || posts[0] || null;

    res.json({
      featured,
      items: posts,
      total: posts.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// GET /api/blog/:id
router.get('/:id', async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const posts = normalizeBlogPosts(await getBlogs(), req);
    const post = posts.find((p) => Number(p.id) === postId);

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json(normalizeBlogPost(post, req));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// POST /api/blog
router.post('/', async (req, res) => {
  try {
    const { title, category, excerpt, content, imageUrl, readTime, date, featured } = req.body;

    if (!title || !excerpt || !imageUrl) {
      return res.status(400).json({ error: 'Title, excerpt, and imageUrl are required' });
    }

    const posts = await getBlogs();
    const newId = posts.length > 0 ? Math.max(...posts.map((p) => Number(p.id) || 0)) + 1 : 1;
    const normalizedImageUrl = normalizeImageUrl(imageUrl, getBaseUrl(req)).trim();

    const isFeatured = Boolean(featured);

    if (isFeatured) {
      // Unset previous featured flags
      posts.forEach((p) => {
        p.featured = false;
      });
    }

    const newPost = {
      id: newId,
      category: (category || 'logistics').toLowerCase().trim(),
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content ? content.trim() : excerpt.trim(),
      date: date || new Date().toISOString().split('T')[0],
      readTime: readTime ? readTime.trim() : '5 min read',
      imageUrl: normalizedImageUrl,
      featured: isFeatured,
      createdAt: new Date().toISOString()
    };

    posts.unshift(newPost); // Place at top of feed
    await saveBlogs(posts);

    res.status(201).json({ message: 'Blog post added successfully', item: newPost });
  } catch (error) {
    console.error('Error adding blog post:', error);
    res.status(500).json({ error: 'Failed to add blog post' });
  }
});

// DELETE /api/blog/:id
router.delete('/:id', async (req, res) => {
  try {
    const postId = Number(req.params.id);
    let posts = await getBlogs();

    const exists = posts.some((p) => Number(p.id) === postId);
    if (!exists) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    posts = posts.filter((p) => Number(p.id) !== postId);
    
    // If deleted post was featured, set first remaining post as featured
    if (posts.length > 0 && !posts.some((p) => p.featured)) {
      posts[0].featured = true;
    }

    await saveBlogs(posts);

    res.json({ message: 'Blog post deleted successfully', id: postId });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

module.exports = router;
