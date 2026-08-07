const express = require('express');
const router = express.Router();
const { getContent, createContent, deleteContent } = require('../src/contentStore');
const { normalizeImageUrl, getPublicBaseUrl } = require('../src/imageUrls');

// GET /api/gallery
router.get('/', async (req, res) => {
  try {
    const category = (req.query.category || 'all').toString().toLowerCase();
    const q = (req.query.q || '').toString().toLowerCase().trim();
    const limit = Number(req.query.limit || 0);

    let results = await getContent('gallery');

    if (category !== 'all') {
      results = results.filter((item) => (item.category || '').toLowerCase() === category);
    }

    if (q) {
      results = results.filter(
        (item) =>
          (item.title || '').toLowerCase().includes(q) ||
          (item.subtitle || '').toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q) ||
          (item.category || '').toLowerCase().includes(q)
      );
    }

    if (limit > 0) {
      results = results.slice(0, limit);
    }

    res.json({ items: results, total: results.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// POST /api/gallery
router.post('/', async (req, res) => {
  try {
    const { title, subtitle, category, description, imageUrl, mobileAspect, desktopLayout } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'Title and imageUrl are required' });
    }

    const items = await getContent('gallery', []);
    const newId = items.length > 0 ? Math.max(...items.map((i) => Number(i.id) || 0)) + 1 : 1;

    const newItem = {
      id: newId,
      category: (category || 'transportation').toLowerCase().trim(),
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : 'Showcase',
      description: description ? description.trim() : '',
      imageUrl: normalizeImageUrl(imageUrl, getPublicBaseUrl(req, 'http://localhost:4000')).trim(),
      created_at: new Date().toISOString()
    };

    const savedItem = await createContent('gallery', newItem);
    if (!savedItem) {
      return res.status(500).json({ error: 'Failed to save gallery item' });
    }

    res.status(201).json({ message: 'Gallery image added successfully', item: savedItem });
  } catch (error) {
    console.error('Error adding gallery image:', error);
    res.status(500).json({ error: 'Failed to add gallery image' });
  }
});

// DELETE /api/gallery/:id
router.delete('/:id', async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    const deleted = await deleteContent('gallery', itemId);

    if (!deleted) {
      return res.status(404).json({ error: 'Gallery item not found', id: req.params.id });
    }

    res.json({ message: 'Gallery item deleted successfully', id: itemId });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ error: 'Failed to delete gallery item', detail: error.message });
  }
});

module.exports = router;
